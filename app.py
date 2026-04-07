from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import smtplib, ssl, random, os, uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from sqlalchemy.sql.expression import func

NEPAL_OFFSET = timedelta(hours=5, minutes=45)


app = Flask(__name__)
app.secret_key = '9866109958'

# Set session lifetime
app.permanent_session_lifetime = timedelta(days=30)


@app.before_request
def make_session_permanent():
    session.permanent = True


@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


@app.errorhandler(413)
def file_too_large(e):
    return "File too large", 413


basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'quizzer.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


EMAIL_SENDER = "quizzer1pro@gmail.com"
EMAIL_PASSWORD = "qkdk onns awhj fnuz"  
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465

def send_otp(receiver_email, otp):
    subject = "Your OTP Code"
    body = f"Here is your Quizzer authentication code: {otp}.\n\nPlease don't share this code with anyone: we'll never ask for it on the phone or via email.\n\nThanks,\nThe Quizzer Team"
    msg = MIMEMultipart()
    msg['From'] = EMAIL_SENDER
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, receiver_email, msg.as_string())


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    username = db.Column(db.String(50), unique=True)
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(256))
    role = db.Column(db.String(10))
    profile_pic = db.Column(db.String(100), nullable=True)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faculty = db.Column(db.String(50))
    course = db.Column(db.String(50))
    semester = db.Column(db.String(10))
    level = db.Column(db.String(20))
    question = db.Column(db.String(500))
    choice1 = db.Column(db.String(200))
    choice2 = db.Column(db.String(200))
    choice3 = db.Column(db.String(200))
    choice4 = db.Column(db.String(200))
    correct_index = db.Column(db.Integer)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    username = db.Column(db.String(50))
    score = db.Column(db.Integer)
    faculty = db.Column(db.String(50))
    course = db.Column(db.String(50))
    semester = db.Column(db.String(10))
    submitted_at = db.Column(db.DateTime, default=db.func.current_timestamp())


with app.app_context():
    db.create_all()

@app.route('/')
def home():
    if 'loggedin' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin'))
        else:
            return redirect(url_for('student_dashboard'))
    return render_template('main_homepage.html')


@app.route('/register', methods=['POST'])
def register():
    # Redirect if already logged in
    if 'loggedin' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin'))
        else:
            return redirect(url_for('student_dashboard'))

    first_name = request.form['first_name'].strip()
    last_name = request.form['last_name'].strip()
    username = request.form['username'].strip().lower()
    email = request.form['email'].strip().lower()
    password = request.form['password']
    confirm_password = request.form['confirm_password']

    if password != confirm_password:
        flash('Passwords do not match!', 'error')
        return render_template('login.html', show_register=True, old_data=request.form)

    existing_user = User.query.filter(
        (db.func.lower(User.email) == email) | (db.func.lower(User.username) == username)
    ).first()
    if existing_user:
        flash('Email or Username already exists! Please login.', 'error')
        return render_template('login.html', show_register=True, old_data=request.form)

    hashed_password = generate_password_hash(password)
    otp = str(random.randint(100000, 999999))
    session['otp'] = otp
    session['temp_user'] = {
        'first_name': first_name,
        'last_name': last_name,
        'username': username,
        'email': email,
        'password': hashed_password
    }

    try:
        send_otp(email, otp)
    except Exception as e:
        flash(f"Error sending OTP: {e}", "error")
        return render_template('login.html', show_register=True, old_data=request.form)

    return redirect(url_for('verify_otp'))


@app.route('/verify_otp', methods=['GET','POST'])
def verify_otp():
    # Redirect if already logged in
    if 'loggedin' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin'))
        else:
            return redirect(url_for('student_dashboard'))

    if request.method == 'POST':
        entered_otp = request.form.get('otp') or (request.get_json() and request.get_json().get('otp'))
        real_otp = session.get('otp')
        user_data = session.get('temp_user')

        if entered_otp == real_otp and user_data:
            new_user = User(
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                role='user'
            )
            db.session.add(new_user)
            db.session.commit()
            session.pop('otp', None)
            session.pop('temp_user', None)
            session['loggedin'] = True
            session['id'] = new_user.id
            session['first_name'] = new_user.first_name
            session['last_name'] = new_user.last_name
            session['username'] = new_user.username
            session['role'] = new_user.role
            session['profile_pic'] = new_user.profile_pic
            return jsonify({"ok": True, "msg": "OTP verified! Registration successful."})

        return jsonify({"ok": False, "msg": "OTP mismatch!"})

    return render_template('verify.html')


@app.route('/resend_otp', methods=['POST'])
def resend_otp():
    user_data = session.get('temp_user')
    if not user_data:
        return jsonify({"ok": False, "msg": "No user data found. Please register again."})
    otp = str(random.randint(100000, 999999))
    session['otp'] = otp
    try:
        send_otp(user_data['email'], otp)
        return jsonify({"ok": True, "msg": f"OTP resent to {user_data['email']}"})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Failed to resend OTP: {e}"})
    

@app.route('/change_otp_email', methods=['POST'])
def change_otp_email():
    data = request.get_json()
    new_email = data.get('email')
    if not new_email:
        return jsonify({"ok": False, "msg": "Email cannot be empty!"})
    user_data = session.get('temp_user')
    if not user_data:
        return jsonify({"ok": False, "msg": "No user data found. Please register again."})
    user_data['email'] = new_email.strip().lower()
    session['temp_user'] = user_data
    otp = str(random.randint(100000, 999999))
    session['otp'] = otp
    try:
        send_otp(new_email, otp)
        return jsonify({"ok": True, "msg": f"OTP sent to new email: {new_email}"})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Failed to send OTP to new email: {e}"})
    

@app.route('/login', methods=['GET','POST'])
def login():
    if 'loggedin' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin'))
        else:
            return redirect(url_for('student_dashboard'))

    if request.method=='POST':
        identifier = request.form['identifier'].strip().lower()
        password_input = request.form['password'].strip()

        user = User.query.filter(db.func.lower(User.email)==identifier).first() \
            or User.query.filter(db.func.lower(User.username)==identifier).first()

        if not user:
            flash("User doesn't exist", "error")
        elif not check_password_hash(user.password, password_input):
            flash("Incorrect password", "error")
        else:
            session.permanent = True
            session['loggedin'] = True
            session['id'] = user.id
            session['first_name'] = user.first_name
            session['last_name'] = user.last_name
            session['username'] = user.username
            session['role'] = user.role
            session['profile_pic'] = user.profile_pic
            return redirect('/admin' if user.role=='admin' else '/student_dashboard')

    return render_template('login.html')


@app.route('/forgot-password', methods=['GET','POST'])
def forgot_password():
    if 'loggedin' in session:
        return redirect(url_for('admin') if session.get('role')=='admin' else url_for('student_dashboard'))

    if request.method=='POST':
        email = request.form['email'].strip().lower()
        user = User.query.filter(db.func.lower(User.email)==email).first()
        if not user:
            flash("Email not registered!", "error")
            return redirect(url_for('forgot_password'))
        otp = str(random.randint(100000,999999))
        session['reset_otp'] = otp
        session['reset_email'] = email
        try:
            send_otp(email, otp)
            flash("OTP sent to your email!", "success")
            return redirect(url_for('verify_reset_otp'))
        except Exception as e:
            flash(f"Failed to send OTP: {e}", "error")
            return redirect(url_for('forgot_password'))
    return render_template('forgot_password.html')


@app.route('/verify-reset-otp', methods=['GET','POST'])
def verify_reset_otp():

    if 'loggedin' in session:
        return redirect(url_for('admin') if session.get('role')=='admin' else url_for('student_dashboard'))

    if 'reset_email' not in session:
        flash("Unauthorized access.", "error")
        return redirect(url_for('forgot_password'))
    
    if request.method=='POST':
        entered_otp = request.form['otp'].strip()
        if entered_otp != session.get('reset_otp'):
            flash("Incorrect OTP!", "error")
            return redirect(url_for('verify_reset_otp'))
        flash("OTP verified! Enter your new password.", "success")
        return redirect(url_for('reset_password'))
    
    return render_template('verify_reset_otp.html')


@app.route('/reset-password', methods=['GET','POST'])
def reset_password():

    if 'loggedin' in session:
        return redirect(url_for('admin') if session.get('role')=='admin' else url_for('student_dashboard'))

    if 'reset_email' not in session:
        flash("Unauthorized access.", "error")
        return redirect(url_for('forgot_password'))
    
    if request.method=='POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        if not password or not confirm_password:
            flash("Please fill out both fields!", "error")
            return redirect(url_for('reset_password'))
        if password != confirm_password:
            flash("Passwords do not match!", "error")
            return redirect(url_for('reset_password'))
        user = User.query.filter(db.func.lower(User.email)==session['reset_email']).first()
        user.password = generate_password_hash(password)
        db.session.commit()
        session.pop('reset_email',None)
        session.pop('reset_otp',None)
        flash("Password changed successfully! Redirecting to login...", "success")
        return render_template('reset_password.html', redirect_login=True)
    
    return render_template('reset_password.html', redirect_login=False)


@app.route('/student_dashboard')
def student_dashboard():
    if 'loggedin' not in session or session.get('role') != 'user':
        return redirect(url_for('login'))

    user = User.query.get(session.get('id'))

    if not user:
        session.clear()
        flash("User not found. Please login again.", "error")
        return redirect(url_for('login'))

    profile_pic = (
        url_for('static', filename='uploads/' + user.profile_pic)
        if user.profile_pic else
        url_for('static', filename='img/default_avatar.png')
    )
    return render_template('student_dashboard.html', username=session.get('username', 'Student'),profile_pic_url=profile_pic)


@app.route('/userprofile', methods=['GET', 'POST'])
def userprofile():
    if 'loggedin' not in session:
        return redirect(url_for('login'))

    user = User.query.get(session.get('id'))
    if not user:
        session.clear()
        flash("User not found.", "danger")
        return redirect(url_for('login'))

    if request.method == 'POST':
        action = request.form.get("action")

        if action == "update_pic" and 'profile_pic' in request.files:
            file = request.files['profile_pic']

            if file.filename == '':
                return jsonify({"ok": False, "error": "No file selected."}) 
            if not file or not allowed_file(file.filename):
                return jsonify({"ok": False, "error": "Invalid or missing file."})

            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(save_path)

            user.profile_pic = filename
            db.session.commit()
            session['profile_pic'] = filename
            return jsonify({"ok": True,"filename": filename})

        elif action == "update_profile":
            new_username = request.form.get('username', '').strip()
            if len(new_username) < 3:
                return jsonify({"ok": False, "error": "Username too short"})

            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user and str(existing_user.id) != str(user.id):
                return jsonify({"ok": False, "error": "Username already taken"})

            user.username = new_username
            db.session.commit()
            session['username'] = new_username
            return jsonify({"ok": True})

        elif action == "change_password":
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')

            if not password or not confirm_password:
                return jsonify({"ok": False, "error": "Password fields cannot be empty."})
            if password != confirm_password:
                return jsonify({"ok": False, "error": "Passwords do not match."})

            user.password = generate_password_hash(password)
            db.session.commit()
            return jsonify({"ok": True})
        
    profile_pic_url = (
        url_for('static', filename='uploads/' + user.profile_pic)
        if user.profile_pic else
        url_for('static', filename='img/default_avatar.png')
    )
    return render_template("user_profile.html",user=user,profile_pic_url=profile_pic_url,current_year=datetime.now().year)

@app.route('/randomquiz')
def random_quiz():
    if 'loggedin' not in session:
        return redirect(url_for('login'))

    course = "be computer"  
    semesters = ['1', '2', '3', '4', '5', '6', '7', '8']  
    selected_questions = []
    for sem in semesters:
        questions = Question.query.filter_by(course=course, semester=sem)\
                                  .order_by(func.random())\
                                  .limit(2).all()
        selected_questions.extend(questions)

    questions_data = []
    for q in selected_questions:
        questions_data.append({
            "question": q.question,
            "options": [q.choice1, q.choice2, q.choice3, q.choice4],
            "correct_index": q.correct_index
        })

    return render_template('randomquiz.html', questions=questions_data, username=session['username'])


@app.route('/quiz')
def quiz():
    if 'loggedin' not in session:
        return redirect(url_for('login'))
    faculty = request.args.get('faculty', '').strip().lower()
    course = request.args.get('course', '').strip().lower()
    semester = request.args.get('semester', '').strip()
    level = request.args.get('level', '').strip().lower()

    if not all([faculty, course, semester, level]):
        return "Invalid quiz selection.", 400
    
    questions = Question.query.filter(
        db.func.lower(Question.faculty) == faculty,
        db.func.lower(Question.course) == course,
        Question.semester == semester,
        db.func.lower(Question.level) == level
    ).all()

    return render_template('quiz.html',questions=questions,username=session['username'],faculty=faculty,course=course,semester=semester)


@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    if 'loggedin' not in session:
        return redirect(url_for('login'))

    score = int(request.form.get('score', 0))
    faculty = request.form.get('faculty', '').strip()
    course = request.form.get('course', '').strip()
    semester = request.form.get('semester', '').strip()

    # Current UTC time + Nepal offset
    nepali_time = datetime.utcnow() + NEPAL_OFFSET

    # Save report with additional info
    new_report = Report(
        user_id=session['id'],
        username=session['username'],
        score=score,
        faculty=faculty,
        course=course,
        semester=semester,
        submitted_at=nepali_time
    )
    db.session.add(new_report)
    db.session.commit()

    return render_template('result.html', score=score, username=session['username'], faculty=faculty, course=course, semester=semester)


@app.route('/becomputer')
def be_computer(): 
    return render_template('becomputer.html')
@app.route('/bca')
def bca():
    return render_template('bca.html')
@app.route('/becivil')
def be_civil(): 
    return render_template('becivil.html')
@app.route('/bba')
def bba():
    return render_template('bba.html')
@app.route('/bbs')
def bbs(): 
    return render_template('bbs.html')


@app.route('/admin')
def admin():
    if 'loggedin' in session and session['role']=='admin':
        users = User.query.all()
        reports = Report.query.order_by(Report.submitted_at.desc()).all()
        return render_template('admin_users.html', users=users, reports=reports)
    return redirect(url_for('login'))

    
@app.route('/admin/update_user', methods=['POST'])
def update_user():
    if 'loggedin' not in session or session.get('role') != 'admin':
        return jsonify({"ok": False, "error": "Unauthorized"}), 403

    data = request.get_json()
    user = User.query.get(data.get('id'))
    if not user:
        return jsonify({"ok": False, "error": "User not found"})

    try:
        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name')
        user.username = data.get('username')
        user.email = data.get('email')
        user.role = data.get('role')
        db.session.commit()
        return jsonify({"ok": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "error": str(e)})


@app.route('/admin/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if 'loggedin' not in session or session.get('role') != 'admin':
        return jsonify({"ok": False, "error": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"ok": False, "error": "User not found"})

    current_admin_id = session.get('id')

    # Prevent deleting self
    if user.id == current_admin_id:
        return jsonify({"ok": False, "error": "You cannot delete yourself!"})

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"ok": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "error": str(e)})

@app.route('/admin/get_questions')
def get_questions():
    if 'loggedin' not in session or session.get('role') != 'admin':
        return jsonify({"ok": False, "error": "Unauthorized"}), 403

    questions = Question.query.order_by(Question.id.desc()).all()
    return jsonify([
        {
            "id": q.id,
            "faculty": q.faculty,
            "course": q.course,
            "semester": q.semester,
            "quiz_level": q.level,
            "question_text": q.question,
            "choice1": q.choice1,
            "choice2": q.choice2,
            "choice3": q.choice3,
            "choice4": q.choice4,
            "correct_index": q.correct_index
        } for q in questions
    ])

@app.route('/admin/get_question/<int:id>')
def get_question(id):
    if 'loggedin' not in session or session.get('role') != 'admin':
        return jsonify({"ok": False, "error": "Unauthorized"}), 403

    q = Question.query.get_or_404(id)
    return jsonify({
        "id": q.id,
        "question": q.question,
        "choice1": q.choice1,
        "choice2": q.choice2,
        "choice3": q.choice3,
        "choice4": q.choice4,
        "correct_index": q.correct_index
    })

@app.route('/admin/update_question/<int:id>', methods=['POST'])
def update_question(id):
    if 'loggedin' not in session or session.get('role') != 'admin':
        return jsonify({"ok": False, "error": "Unauthorized"}), 403

    data = request.json
    try:
        q = Question.query.get_or_404(id)
        q.question = data['question']
        q.choice1 = data['choice1']
        q.choice2 = data['choice2']
        q.choice3 = data['choice3']
        q.choice4 = data['choice4']
        q.correct_index = data['correct_index']
        db.session.commit()
        return jsonify({"ok": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "error": str(e)})

@app.route('/admin/delete_question/<int:id>', methods=['DELETE'])
def delete_question(id):
    if 'loggedin' not in session or session.get('role') != 'admin':
        return jsonify({"ok": False, "error": "Unauthorized"}), 403

    try:
        q = Question.query.get_or_404(id)
        db.session.delete(q)
        db.session.commit()
        return jsonify({"ok": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "error": str(e)})
    
@app.route('/add_question', methods=['GET', 'POST'])
def add_question():
    if 'loggedin' not in session or session['role'] != 'admin':
        return redirect(url_for('login'))

    if request.method == 'POST':
        data = request.get_json() or request.form  # handle AJAX or form submission

        try:
            # Normalize and clean data
            faculty = data['faculty'].strip().lower()   # store lowercase
            course = data['course'].strip().lower()     # store lowercase
            semester = str(data['semester']).strip()
            level = data['quizLevel'].strip().lower()   # lowercase for consistency
            question_text = data['questionText'].strip()
            choice1 = data['choice1'].strip()
            choice2 = data['choice2'].strip()
            choice3 = data['choice3'].strip()
            choice4 = data['choice4'].strip()
            
            correct = data['correctAnswer'].strip().lower()
            correct_index = {"choice1":0, "choice2":1, "choice3":2, "choice4":3}.get(correct, 0)

            # Create question object
            new_question = Question(
                faculty=faculty,
                course=course,
                semester=semester,
                level=level,
                question=question_text,
                choice1=choice1,
                choice2=choice2,
                choice3=choice3,
                choice4=choice4,
                correct_index=correct_index
            )

            db.session.add(new_question)
            db.session.commit()
            return jsonify({"ok": True, "msg": "Question added successfully!"})

        except Exception as e:
            db.session.rollback()
            return jsonify({"ok": False, "error": str(e)})

    return render_template('add_question.html')


@app.route('/admin/reports')
def admin_reports():
    if 'loggedin' in session and session['role']=='admin':
        reports = Report.query.order_by(Report.submitted_at.desc()).all()
        return render_template('reports.html', reports=reports)
    return redirect(url_for('login'))


@app.route('/admin/delete_report/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({"ok": False, "error": "Report not found"}), 404
    try:
        db.session.delete(report)
        db.session.commit()
        return jsonify({"ok": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "error": str(e)}), 500
    
@app.route('/check_username')
def check_username():
    username = request.args.get('username', '').strip()
    exists = User.query.filter_by(username=username).first()
    return jsonify({"available": exists is None})

@app.route('/logout')
def logout():
    session.clear()
    flash("You have been logged out successfully.", "success")
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)