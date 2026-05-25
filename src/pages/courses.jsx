export default function Courses() {

  const roles = [

    {
      role: "Frontend Developer",
    
      color: "#4f46e5",

      courses: [
        {
          title: "Meta Front-End Developer Professional Certificate",
          provider: "Coursera",
          link: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        },

        {
          title: "React Basics",
          provider: "Coursera - Meta",
          link: "https://www.coursera.org/learn/react-basics",
        },

        {
          title: "HTML, CSS & JavaScript Full Course",
          provider: "YouTube - SuperSimpleDev",
          link: "https://www.youtube.com/watch?v=G3e-cpL7ofc",
        },

        {
          title: "Frontend Development using React",
          provider: "Coursera",
          link: "https://www.coursera.org/learn/frontend-development-using-react",
        },
      ],
    },

    {
      role: "Backend Developer",
  
  

      courses: [
        {
          title: "Meta Full Stack Developer Certificate",
          provider: "Coursera",
          link: "https://www.coursera.org/specializations/meta-full-stack-developer",
        },

        {
          title: "Backend Web Development",
          provider: "YouTube - freeCodeCamp",
          link: "https://www.youtube.com/watch?v=Oe421EPjeBE",
        },

        {
          title: "Node.js API Development",
          provider: "Coursera",
          link: "https://www.coursera.org/",
        },

        {
          title: "System Design Fundamentals",
          provider: "YouTube - Gaurav Sen",
          link: "https://www.youtube.com/c/GauravSensei",
        },
      ],
    },

    {
      role: "Data Scientist",
   
      color: "#06b6d4",

      courses: [
        {
          title: "Python for Data Science",
          provider: "NPTEL",
          link: "https://onlinecourses.nptel.ac.in/noc26_cs80/preview",
        },

        {
          title: "Data Science for Engineers",
          provider: "NPTEL - IIT Madras",
          link: "https://nptel.ac.in/courses/106106179",
        },

        {
          title: "Introduction to Machine Learning",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106106139",
        },

        {
          title: "Machine Learning Full Course",
          provider: "YouTube - freeCodeCamp",
          link: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
        },
      ],
    },

    {
      role: "Data Analyst",
     
      color: "#0ea5e9",

      courses: [
        {
          title: "Google Data Analytics Professional Certificate",
          provider: "Coursera",
          link: "https://www.coursera.org/professional-certificates/google-data-analytics",
        },

        {
          title: "Data Analytics with Python",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106105174",
        },

        {
          title: "SQL for Data Analysis",
          provider: "Coursera",
          link: "https://www.coursera.org/learn/sql-for-data-science",
        },

        {
          title: "Power BI Full Course",
          provider: "YouTube - freeCodeCamp",
          link: "https://www.youtube.com/watch?v=e6QD8lP-m6E",
        },

        {
          title: "Excel Data Analytics Full Course",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=Vl0H-qTclOg",
        },
      ],
    },

    {
      role: "Data Engineer",
   
      color: "#14b8a6",

      courses: [
        {
          title: "IBM Data Engineering Professional Certificate",
          provider: "Coursera",
          link: "https://www.coursera.org/professional-certificates/ibm-data-engineer",
        },

        {
          title: "Big Data Computing",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106104189",
        },

        {
          title: "Apache Spark Full Course",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=_C8kWso4ne4",
        },

        {
          title: "Data Engineering Roadmap",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=qWru-b6m030",
        },
      ],
    },

    {
      role: "Software Engineer",
      
      color: "#6366f1",

      courses: [
        {
          title: "Software Engineering Essentials",
          provider: "Coursera",
          link: "https://www.coursera.org/specializations/software-engineering",
        },

        {
          title: "Operating Systems",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106106144",
        },

        {
          title: "Object Oriented Programming",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106105191",
        },

        {
          title: "Software Engineering Full Course",
          provider: "YouTube - freeCodeCamp",
          link: "https://www.youtube.com/watch?v=O75AqTInKDU",
        },
      ],
    },

    {
      role: "AI / ML Engineer",
     
      color: "#f59e0b",

      courses: [
        {
          title: "Machine Learning and Deep Learning Fundamentals",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/108103192",
        },

        {
          title: "Deep Learning - Part 1",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106106184",
        },

        {
          title: "Practical Machine Learning with Tensorflow",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106106213",
        },

        {
          title: "Machine Learning Crash Course",
          provider: "Google",
          link: "https://developers.google.com/machine-learning/crash-course",
        },
      ],
    },

    {
      role: "Cyber Security Engineer",
     
      color: "#ef4444",

      courses: [
        {
          title: "Google Cybersecurity Certificate",
          provider: "Coursera",
          link: "https://www.coursera.org/professional-certificates/google-cybersecurity",
        },

        {
          title: "Ethical Hacking Essentials",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
        },

        {
          title: "Cyber Security and Privacy",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106106129",
        },

        {
          title: "Network Security",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106105217",
        },
      ],
    },

    {
      role: "Cloud Engineer",
     
      color: "#8b5cf6",

      courses: [
        {
          title: "AWS Full Course",
          provider: "YouTube - freeCodeCamp",
          link: "https://www.youtube.com/watch?v=Ia-UEYYR44s",
        },

        {
          title: "Google Cloud Fundamentals",
          provider: "Coursera",
          link: "https://www.coursera.org/",
        },

        {
          title: "Cloud Computing",
          provider: "NPTEL",
          link: "https://nptel.ac.in/courses/106105167",
        },

        {
          title: "Azure Fundamentals",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=NKEFWyqJ5XA",
        },
      ],
    },

    {
      role: "DevOps Engineer",
      
      color: "#7c3aed",

      courses: [
        {
          title: "Docker & Kubernetes Full Course",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=3c-iBn73dDE",
        },

        {
          title: "DevOps Full Course",
          provider: "YouTube - freeCodeCamp",
          link: "https://www.youtube.com/watch?v=9pZ2xmsSDdo",
        },

        {
          title: "Linux for Beginners",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=sWbUDq4S6Y8",
        },

        {
          title: "CI/CD Pipeline Tutorial",
          provider: "YouTube",
          link: "https://www.youtube.com/watch?v=scEDHsr3APg",
        },
      ],
    },

  ];

  return (

    <div className="min-h-screen bg-white px-6 py-20">

      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <div className="text-center mb-20">

          <div className="inline-block px-5 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-semibold mb-6">
             Career Roadmaps
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gray-900">

            Recommended
            <br />

            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Courses
            </span>

          </h1>

          <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-8">

            Explore curated learning paths for different tech careers.
            Learn from top platforms like Coursera, NPTEL, Google,
            and YouTube to become job-ready.

          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">

          {[
            ["80+", "Courses"],
            ["10", "Career Paths"],
            ["Top", "Platforms"],
            ["Free + Paid", "Resources"],
          ].map(([num, label]) => (

            <div
              key={label}

              className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300"
            >

              <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {num}
              </div>

              <div className="text-gray-600 mt-3 text-sm font-medium">
                {label}
              </div>

            </div>

          ))}

        </div>

        {/* ROLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {roles.map((role) => (

            <div
              key={role.role}

              className="group bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >

              {/* HEADER */}
              <div className="flex items-center gap-4 mb-6">

                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: `${role.color}15`,
                  }}
                >
                  {role.icon}
                </div>

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    {role.role}
                  </h2>

                  <p className="text-gray-500 text-sm">
                    Curated learning roadmap
                  </p>

                </div>

              </div>

              {/* COURSES */}
              <div className="space-y-4">

                {role.courses.map((course, index) => (

                  <a
                    key={index}

                    href={course.link}

                    target="_blank"

                    rel="noreferrer"

                    className="block p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 transition-all duration-300"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-semibold text-gray-900 mb-2">
                          {course.title}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {course.provider}
                        </p>

                      </div>

                      <div
                        className="text-sm font-semibold"
                        style={{
                          color: role.color,
                        }}
                      >
                        Open →
                      </div>

                    </div>

                  </a>

                ))}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}