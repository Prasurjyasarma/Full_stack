# Full_stack_todo_list

👉 How to set up and run the project:

    Backend Setup:
        ✅ Ensure Python is installed on your system, then follow these steps:
            📝 cd back-end
            📝 cd server
            📝 pip install -r requirements.txt
            📝 python manage.py makemigrations
            📝 python manage.py migrate
            📝 python manage.py runserver
            
    Frontend Setup:
        ✅ Ensure Node.js is installed on your system, then follow these steps:
            📝 cd front-end
            📝 cd client
            📝 npm install --force
            📝 npm run dev


👉 Assumptions made during development:

  📝 AI assistance is utilized for guidance and support throughout the development process.

  📝 Any necessary libraries and frameworks can be freely integrated to enhance functionality and efficiency.

  📝 The application is optimized for performance and maintainability but does not strictly adhere to industry-level optimization standards.


👉 List of technologies/libraries used:

  ✅ Backend: SQLLite, Django, DjangoREST Frame work, JWS Token
  ✅ Frontend: React


👉 Challenges faced and how they were addressed:

  📝 Establishing Frontend-Backend Interaction and Handling JWT Tokens

       Challenge: Integrating the frontend with the backend, particularly managing JWT tokens (access and refresh tokens), was a new experience.
       Solution: Conducted extensive research on token storage methods and successfully implemented a solution using local storage. Additionally, modified the backend to properly handle user logout functionality.

  📝 Difficulties with Django Serializers

      Challenge: Encountered issues with Django serializers, as there was a mismatch between the fields specified in the backend and the data being sent from the frontend.
      Solution: Debugged the serializer configurations and identified the discrepancy—four fields were expected in the backend while only two were being sent from the frontend. Adjusted the implementation accordingly to ensure proper data handling.

 📝 Complexity in Writing API Request Handling (api.js)

      Challenge: Developing api.js was challenging, particularly implementing token validation and refreshing expired access tokens.
      Solution: Conducted in-depth research and found a tutorial that provided a clear explanation of the process. Successfully implemented the mechanism to validate access tokens and send a refresh token request when necessary.

 📝 Ensuring a Responsive and Modern UI

      Challenge: Achieving a responsive and visually appealing UI was difficult due to the use of vanilla CSS.
      Solution: Utilized AI assistance to refine the styling, improve responsiveness, and enhance the overall aesthetic to achieve a clean and modern look.
