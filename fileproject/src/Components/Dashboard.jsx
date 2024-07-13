import React, { useEffect, useRef, useState } from 'react';

const Dashboard = () => {
  const [userdata, setUserdata] = useState({});
  const [editEnable, setEditEnable] = useState(false);
  const profileRef = useRef(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    Bio: '',
    email: '',
    phone_no: '',
    dob: '',
    address: '',
    profile_image: ''
  });

  const [addskills, setAddskills] = useState(false);
  const [skills, setSkills] = useState([]);
  const [addProject, setAddProject] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await fetch('http://localhost:5000/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        });
        const dashboardData = await dashboardResponse.json();
        setUserdata(dashboardData);
        setFormData({
          firstname: dashboardData.firstname,
          lastname: dashboardData.lastname,
          Bio: dashboardData.Bio,
          email: dashboardData.email,
          phone_no: dashboardData.phone_no,
          dob: dashboardData.dob,
          address: dashboardData.address,
          profile_image: dashboardData.profile_image
        });

        const skillsResponse = await fetch('http://localhost:5000/getSkills', {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        });
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);


        const projectResponse = await fetch('http://localhost:5000/getProjects', {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        });
        const projectData = await projectResponse.json();
        setProjects(projectData);
      }
      catch (error) {
        console.error('Error fetching data:', error);
      }

    };

    fetchData();
  }, []);

  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date not available';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', dateOptions).format(date);
  };

  const handleEdit = () => {
    setEditEnable(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData)
    fetch('http://localhost:5000/updateProfile', {
      method: 'PUT',
      headers: {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }).then(res => res.json())
      .then(data => {
        setUserdata(data);
        setEditEnable(false);
      });
  };

  const handleClose = () => {
    setEditEnable(false);
  };

  const handleDownload = async () => {
    const profileHTML = profileRef.current.innerHTML; // Get the HTML of the profile section

//     const css = `
// .dashboard {
//   padding: 20px;
// }

// .dashboard-container {
//   display: flex;
//   justify-content: space-between;
// }

// .profile-box {
//   display: flex;
//   align-items: center;
//   padding: 20px;
//   background-color: #f0f0f0;
//   border-radius: 8px;
//   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
// }

// .profile-image {
//   border: 1px solid #000;
//   width: 150px;
//   height: 150px;
//   border-radius: 50%;
//   object-fit: cover;
//   margin-right: 20px;
//   text-align: center;
//   align-content: center;
// }

// .profile-info {
//   flex: 1;
// }

// .info-box {
//   flex: 1;
//   padding: 20px;
//   background-color: #f9f9f9;
//   border-radius: 8px;
//   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
// }

// .info-box h2 {
//   font-size: 24px;
//   margin-bottom: 10px;
// }

// .info-box p {
//   margin-bottom: 8px;
//   padding: 5px;
// }`;

//     const profileHTMLWithCSS = `
//         <html>
//           <head>
//             <style>${css}</style>
//           </head>
//           <body>${profileHTML}</body>
//         </html>
//       `;
//     console.log(profileHTMLWithCSS)
    await fetch('http://localhost:5000/downloadProfile', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html: profileHTML })
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'profile.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch(error => console.error('Download error:', error));
  };

  const handleSkils = () => {
    setAddskills(true);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const skillname = e.target.skillname.value;
    const skilllevel = e.target.skilllevel.value;

    fetch('http://localhost:5000/addSkill', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ skillname, skilllevel })
    }).then(res => res.json())
      .then(data => {
        console.log(data);
        setAddskills(false);
      });
  };

  const handleProject = (e) => {
    e.preventDefault();
    const project_name = e.target.projectname.value;
    const project_description = e.target.projectdescription.value;
    const project_link = e.target.projectlink.value;

    fetch('http://localhost:5000/addProject', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ project_name, project_description, project_link })
    }).then(res => res.json())
      .then(() => {
        setAddProject(false);
      });
  };

  return (
    <div ref={profileRef}>
      <h1 className='hide-btn'>Welcome to your Dashboard</h1>
      <button className='edit-btn hide-btn' onClick={handleEdit}>Edit</button>
      <button className='download-btn hide-btn' onClick={handleDownload}>Download Profile as PDF</button><br /><br />
      <div className="dashboard-container">
        <div className="profile-box">
          {userdata.profile_image ? (
            <img src={`data:image/png;base64,${userdata.profile_image}`} alt="Profile" className="profile-image" />
          ) : (
            <p className="profile-image-placeholder">No Profile Image</p>
          )}
          <div className="profile-info">
            <p><strong>{userdata.firstname} {userdata.lastname}</strong></p>
            <p><strong>Bio:</strong> {userdata.Bio}</p>
          </div>
        </div>
        <div className="info-box">

          <h2>Personal Information</h2>
          <p><strong>Email:</strong> {userdata.email}</p>
          <p><strong>Phone:</strong> {userdata.phone_no}</p>
          <p><strong>Date of Birth:</strong> {formatDate(userdata.dob)}</p>
          <p><strong>Address:</strong> {userdata.address}</p>
          <p><strong>Account Created At:</strong> {formatDate(userdata.datacreated)}</p>
        </div>
      </div>

      {editEnable && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
              <label>
                First Name:
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                />
              </label>
              <label>
                Last Name:
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </label>
              <label>
                Bio:
                <textarea
                  name="Bio"
                  value={formData.Bio}
                  onChange={handleChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </label>
              <label>
                Phone Number:
                <input
                  type="text"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleChange}
                />
              </label>
              <label>
                Date of Birth:
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </label>
              <label>
                Address:
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </label>
              <label>
                Profile Image:
                <input
                  type="file"
                  name="profile_image"
                  onChange={handleChange}
                />
              </label>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={handleClose}>Close</button>
            </form>
          </div>
        </div>
      )}

      <button className='hide-btn' onClick={handleSkils}>Add Skills</button>

      {addskills && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Skills</h2>
            <form onSubmit={handleAddSkill}>
              <label>
                Skill Name:
                <input type="text" name="skillname" />
              </label>
              <label>
                Skill Level:
                <input type="text" name="skilllevel" />
              </label>
              <button type="submit">Add Skill</button>
              <button type="button" onClick={() => setAddskills(false)}>Close</button>
            </form>
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="skills-section">
          <h2>Skills</h2>
          <ul className="skills-list">
            {skills.map((skill, index) => (
              <li key={index} className="skill-item">{skill.skill_name} - {skill.skill_level}</li>
            ))}
          </ul>
        </div>
      )}

      <button className='hide-btn' onClick={() => setAddProject(true)}>Add Project</button>

      {addProject && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Project</h2>
            <form onSubmit={handleProject}>
              <label>
                Project Name:
                <input type="text" name="projectname" />
              </label>
              <label>
                Project Description:
                <textarea name="projectdescription" />
              </label>
              <label>
                Project Link:
                <input type="text" name="projectlink" />
              </label>
              <button type="submit">Add Project</button>
              <button type="button" onClick={() => setAddProject(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div className="projects-section">
          <h2>Projects</h2>
          <ul className="projects-list">
            {projects.map((project, index) => (
              <li key={index} className="project-item">
                <p><strong>Project Name:</strong> {project.project_name}</p>
                <p><strong>Project Description:</strong> {project.project_description}</p>
                <p><strong>Project Link:</strong> <a href={project.project_link} target="_blank" rel="noreferrer">{project.project_link}</a></p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
