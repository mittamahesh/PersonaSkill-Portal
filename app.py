from flask import Flask, jsonify, request, send_file, render_template, make_response, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
import datetime
import base64
import pdfkit
import os
from weasyprint import HTML
 


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allowing all origins for now. You can restrict this to specific domains.

# app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://SA:Mitta132@localhost/mydb?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes'

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///myapp.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'thisismysecretkey'

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    firstname = db.Column(db.String(80), nullable=False)
    lastname = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_no = db.Column(db.String(80), nullable=False)
    Bio = db.Column(db.String(200), nullable=False)
    dob = db.Column(db.DateTime, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    profile_image = db.Column(db.LargeBinary)

    datacreated = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'firstname': self.firstname,
            'lastname': self.lastname,
            'email': self.email,
            'phone_no': self.phone_no,
            'Bio': self.Bio,
            'dob': self.dob,
            'address': self.address,
            'datacreated': self.datacreated,
            'profile_image': self.profile_image
        }
    
class Skills(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    skill_name = db.Column(db.String(80), nullable=False)
    skill_level = db.Column(db.String(80), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self): 
        return f'<Skill {self.skill_name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'skill_name': self.skill_name,
            'skill_level': self.skill_level,
            'user_id': self.user_id
        }

class Projects(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(80), nullable=False)
    project_description = db.Column(db.String(200), nullable=False)
    project_link = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self): 
        return f'<Project {self.project_name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'project_name': self.project_name,
            'project_description': self.project_description,
            'project_link': self.project_link,
            'user_id': self.user_id
        }

# with app.app_context():
#     db.create_all()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join('fileproject', 'dist', path)):
        return send_from_directory(os.path.join('fileproject', 'dist'), path)
    else:
        return send_from_directory(os.path.join('fileproject', 'dist'), 'index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    data = request.form

    username = data['username']
    email = data['email']
    password = data['password']
    hashed_password = Bcrypt().generate_password_hash(password)
    firstname = data['firstname']
    lastname = data['lastname']
    phone_no = data['phone_no']
    Bio = data['bio']
    dob = data['dob']
    address = data['address']
    if 'profile_image' in request.files:
        # Read image data
        profile_image = request.files['profile_image'].read()
    else:
        profile_image = None

    new_user = User(username=username, email=email, password=hashed_password, firstname=firstname,
                    lastname=lastname, phone_no=phone_no, Bio=Bio, dob=dob, address=address, profile_image=profile_image)

    db.session.add(new_user)
    db.session.commit()
    return {'message': 'User created successfully'}


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data['username'] or not data['password']:
        return jsonify({'message': 'Could not verify!'}, 401, {'WWW-dataenticate': 'Basic realm="Login required!"'})

    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({'message': 'Could not find username!'}, 401, {'WWW-dataenticate': 'Basic realm="Login required!"'})

    if Bcrypt().check_password_hash(user.password, data['password']):
        token = jwt.encode({'id': user.id, 'exp': datetime.datetime.utcnow(
        ) + datetime.timedelta(minutes=30)}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token})

    return jsonify({'message': 'Could not verify!'}, 401, {'WWW-dataenticate': 'Basic realm="Login required!"'})


@app.route('/dashboard', methods=['GET'])
def dashboard():
    token = request.headers.get('Authorization')
    print('token', token)
    if not token:
        return jsonify({'message': 'Token is missing!'}, 401, {'WWW-dataenticate': 'Basic realm="Login required!"'})

    try:
        data = jwt.decode(
            token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=data['id']).first()
        if user:
            profile_image_base64 = base64.b64encode(user.profile_image).decode(
                'utf-8') if user.profile_image else None
            users = {
                'id': user.id,
                'username': user.username,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'email': user.email,
                'phone_no': user.phone_no,
                'Bio': user.Bio,
                'dob': user.dob.isoformat(),  # Convert datetime to ISO format for JSON serialization
                'address': user.address,
                'datacreated': user.datacreated.isoformat(),
                'profile_image': profile_image_base64  # Send profile image as base64 string
            }
            return jsonify(users)
        else:
            return jsonify({'message': 'User not found!'}), 404
    except:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-dataenticate': 'Basic realm="Login required!"'})


@app.route('/updateProfile', methods=['PUT'])
def update_profile():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            return jsonify({'message': 'User not found!'}), 404

        update_data = request.get_json()

        user.firstname = update_data.get('firstname', user.firstname)
        user.lastname = update_data.get('lastname', user.lastname)
        user.Bio = update_data.get('Bio', user.Bio)
        user.email = update_data.get('email', user.email)
        user.phone_no = update_data.get('phone_no', user.phone_no)
        user.dob = datetime.datetime.fromisoformat(update_data.get('dob', user.dob.isoformat()))
        user.address = update_data.get('address', user.address)

        profile_image_base64 = update_data.get('profile_image')
        if profile_image_base64:
            user.profile_image = base64.b64decode(profile_image_base64)

        db.session.commit()

        updated_user_data = {
            'id': user.id,
            'username': user.username,
            'firstname': user.firstname,
            'lastname': user.lastname,
            'email': user.email,
            'phone_no': user.phone_no,
            'Bio': user.Bio,
            'dob': user.dob.isoformat(),
            'address': user.address,
            'datacreated': user.datacreated.isoformat(),
            'profile_image': profile_image_base64
        }
        return jsonify(updated_user_data)
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

@app.route('/downloadProfile', methods=['POST'])
def download_profile():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            return jsonify({'message': 'User not found!'}), 404

        css_path = 'fileproject/src/App.css'
        options = {
            'user-style-sheet': css_path
        }
        request_data = request.get_json()
        profile_html = request_data.get('html')

        pdfkit.from_string(profile_html, 'profile.pdf', options=options)
        

        return send_file('profile.pdf', as_attachment=True, download_name='profile.pdf')
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except Exception as e:
        return jsonify({'message': 'An error occurred while generating PDF', 'error': str(e)}), 500


@app.route('/addSkill', methods=['POST'])
def skills():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            return jsonify({'message': 'User not found!'}), 404

        request_data = request.get_json()
        skill_name = request_data.get('skillname')
        skill_level = request_data.get('skilllevel')
        new_skill = Skills(skill_name=skill_name,skill_level = skill_level ,user_id=user.id)
        db.session.add(new_skill)
        db.session.commit()

        return jsonify(new_skill.to_dict())
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

@app.route('/getSkills', methods=['GET'])
def getskills():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            return jsonify({'message': 'User not found!'}), 404

        skills = Skills.query.filter_by(user_id=user.id).all()
        return jsonify([skill.to_dict() for skill in skills])
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

@app.route('/addProject', methods=['POST'])
def addproject():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            return jsonify({'message': 'User not found!'}), 404

        request_data = request.get_json()
        project_name = request_data.get('project_name')
        project_description = request_data.get('project_description')
        project_link = request_data.get('project_link')
        new_project = Projects(project_name=project_name,project_description=project_description,project_link=project_link,user_id=user.id)
        db.session.add(new_project)
        db.session.commit()

        return jsonify(new_project.to_dict())
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

@app.route('/getProjects', methods=['GET'])
def getProjects():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            return jsonify({'message': 'User not found!'}), 404

        projects = Projects.query.filter_by(user_id=user.id).all()
        return jsonify([project.to_dict() for project in projects])
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    
@app.route('/demo')
def download_pdf():
    # token = request.headers.get('Authorization')
    # print('token', token)
    # if not token:
    #     return jsonify({'message': 'Token is missing!'}, 401, {'WWW-dataenticate': 'Basic realm="Login required!"'})

    try:
        # data = jwt.decode(
        #     token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.filter_by(id=1).first()
        if user:
            profile_image_base64 = base64.b64encode(user.profile_image).decode(
                'utf-8') if user.profile_image else None
            users = {
                'id': user.id,
                'username': user.username,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'email': user.email,
                'phone_no': user.phone_no,
                'Bio': user.Bio,
                'dob': user.dob.isoformat(),  # Convert datetime to ISO format for JSON serialization
                'address': user.address,
                'datacreated': user.datacreated.isoformat(),
                'profile_image': profile_image_base64  # Send profile image as base64 string
            }
            skills = Skills.query.filter_by(user_id=user.id).all()
            projects = Projects.query.filter_by(user_id=user.id).all()
            print(users,skills,projects)
            return render_template('indesx.html', user=users, skills=skills, projects=projects)
    except:
        return jsonify({'message': 'Token is invalid!'}, 401, {'WWW-dataenticate': 'Basic realm="Login required!"'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
