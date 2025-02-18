# Ript Fitness

## App Description:
#### Ript Fitness is a full-stack application that :
- Uses Java Spring Boot as the backend 
- React Native as the frontend framework
- TypeScript as the frontend language
- Microsoft Azure for deployment
- Docker for containerized development
- Maven as a build automation tool
- MySql for the database

#### Through the first semester of work on this app, features in the application include: 
- Social feed 
- Nutrition tracker
- Workout tracker
- Friend's list
- User profile with account settings
- Pictures hosted through Microsoft Blog Storage
It uses a hashing algorithm to store usernames and passwords, and JWT tokens to authenticate users when backend endpoints are called. 

**The ultimate goal for this app is to make it to the app store on iOS and Android.**

## Setting up the backend:

### Step 1: Download Spring Tools (Spring Boot)
- This is the IDE used to code in (for the backend)
- Link to download: https://spring.io/tools
- Based on your preference, you can install the tools for Eclipse, Visual Studio Code, or Theia
- For Eclipse, click on the download for your operating system
- Once installed, click on the package in your downloads folder (spring-tool-suite…) and then the inner folder (sts…)
- Open the application by double clicking on SpringToolSuite<#> with the green leaf icon
- It should open replicating Eclipse, VS code, or Theia based on your initial installation selection
- Please note: this README will focus on setting up the project for the Eclipse replication

### Step 2: Download Desktop Docker:
- Link to download: https://www.docker.com/products/docker-desktop/
- Scroll down to Download Docker Desktop and select the version based on your operating system
- Once downloaded, double click on the Docker Desktop Installer in your Downloads folder and follow the instructions to install
- Open the application and check that in the bottom right corner it says “Engine running”
- You should pause the engine when you are not working on the project
- If it says "Resource saver mode" or "Engine paused", you'll need to click the arrow next to it to start the Docker engine. 

### Step 3: Download MySQL Workbench
- Link to download: https://dev.mysql.com/downloads/windows/installer/8.0.html 
- Click Download for mysql-installer-community-<version-number>.msi
- If you don’t have an account or want to make one, select “No thanks, just start my download.”
- Find the download in your Downloads folder and double click on it
- Follow the instructions to install
    - Remember your root password
- If you’ve installed WorkBench before, it won’t ask you for a new root password, so if you forgot, reinstall WorkBench to reset it

### Step 4: Download Postman
- Link to download: https://www.postman.com/downloads
- Click on Windows 64-bit
- Click on the installer to complete the installation
- Get the credentials from Dr. Jiang for the Postman account with the HTTP endpoints that already exist
    - Note: this is a free account, so only 3 people can use it at once. 

### Step 5: Download Maven
- Install Java JDK first if you don’t have it already: https://www.oracle.com/java/technologies/downloads/ 
- Use java -version from the terminal/command prompt to check that it’s been correctly installed
- Install Maven - link to download: https://maven.apache.org/download.cgi
- Select binary zip archive for Windows and binary tar.gz archive for Mac
- Unzip the package
- Add Maven to your path variable
- This goes into more detail about installing Maven (for Windows): https://phoenixnap.com/kb/install-maven-windows 
- Check that Maven is installed correctly with mvn -v

### Step 6: Import Project
- This is for the Eclipse interface for Spring Suite (although VS Code’s should be similar)
- Clone this repository and remember where it’s located on your local machine
    -     git clone https://github.com/COSC481W-2025Winter/Ript-Fitness.git
- In Spring Tool Suite, click “File” in the upper left corner and then “Import”
- Then click the “>” next to “Maven”, select “Existing Maven Projects”, and then “Next >”
- Click “Browse” and select the repository’s backend folder (should contain a Pom.xml file)
- You should see something like "/backend/Ript-Fitness-Backend/pom.xml" in the projects section
- Click the checkmark next to that project and then "Finish"
- You should now see the project in the Project Explorer

### Step 7: Make a .env file + Azure connection
- Open a text editor and copy/paste the following:

MYSQL_DATABASE=riptfitness_database

MYSQL_ROOT_PASSWORD=

PORT=3308:3306

SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3308/riptfitness_database

SPRING_DATASOURCE_USERNAME=root

SPRING_DATASOURCE_PASSWORD=

JWT_SECRET=

BLOB_CONNECTION_STRING=

BLOB_CONTAINER_NAME=
- Get the not included information from the professor
- Once all the information is there, click “Save as type:” and select “All types”
- Save the file as “.env” in the same directory as the backend src folder (which includes Pom.xml)
- To confirm the file is saved correctly, using Git Bash, cd into the folder containing the repository and call "git status
    - If your .env pops up when git status is called, go back and confirm you've saved it in the right place, that it's a .env file, and its name is ".env"
    - The .gitignore should stop it from being pushed to GitHub, but if you saved it incorrectly, then you'll need to save it correctly before continuing to avoid pushing your passwords to the repository
- For the Azure connection to MySQL open MySQL Workbench
- Click + next to connections
- The connection name can be anything
- Get the Hostname, Username, and Password from the professor

### Step 8: Run the backend
- In Spring Tool Suite right click on the project in the Project Explorer, find "Run as", and select "Spring Boot App"
- The server should begin to run, and the Docker container should be created automatically, as well as the local database tables
- You'll know that the server started up successfully when you see the last line say "Completed initialization in 1 ms" (or 2 ms)
    - If you get a null pointer exception that is about 100 lines long, it means you did not save the .env file correctly
    - If the error message says something about "Docker", make sure that Docker Desktop is open and that the engine is running in the lower left corner
- Once successfully ran, you'll see the Docker container running on port "3308:3306"
    - Every time you run the server, you'll need to make sure that Docker Desktop is open, and that the engine/container are running.
- To run the container, click the play button next to the "ript_fitness_backend" container name under "Actions"
- If everything else is correct but the server still isn't running correctly, make sure that "mysql" is defined in your path variables
    - You can confirm this by typing "mysql --version" in a CLI with your version of MySql popping up when called

## Setting up the Frontend:
**It is recommended to use Visual Studio Code to easily access the terminal to run your server and handle branches using Git**
- VS Code download link: https://code.visualstudio.com/
### Step 1: Download Node.js
- Link to download: https://nodejs.org/en
- Open download when completed
- When it asks you if you want to install Chocolatey, you don’t have to check it
- Continue through to install and then click finish

### Step 2: Install, check, and scan dependencies
- Open VS Code
- Click File, Open Folder, and locate the Ript-Fitness project folder
- Open a new terminal in VS code and cd into the frontend folder
- Run this command to install the app’s dependencies:
    -     npm install
- Run this command to check the dependencies and your version of the EXPO CLI, installing versions known to work with your EXPO CLI:
    -     npx expo install --check
- Run this command to scan installed dependencies for known security vulnerabilities:
    -     npm audit fix

### Step 3: Run the app
You have two choices:
- The first runs connected to the Azure server
    - Recommended for anyone developing the front-end
    - Command:
        -     npx expo start
- The second runs a NodeJS script that sets up a .env file in the frontend to use your current local IPV4 address (127.0.0.1 or localhost does not work if connecting using your phone), and set USE_LOCAL to true, then revert it to normal when you close the server. 
    - This will allow anyone wanting to run both the backend and the frontend on their computer to connect with minimal intervention
    - Command:
        -     npm start

## Working with Microsoft Azure:
- The professor will have the Azure connection details
- Azure hosts Ript-Fitness in the form of a Docker Container App, a MySQL database, as well as Azure Blob Service used for the private photos
- There's a github action that automatically builds the backend and creates a docker container, and pushes it to Azure, which should allow for minimal manual intervention, and allow anyone working on the frontend to develop without running Java SpringBoot or Docker

#### Security:
- Private Photos use an SaS token
- This is appended to the URL inside of the backend code. It is used as verification so that only the user who added the private photo to the Ript-Fitness app can view it. 
- Not to be confused with User Profile Pictures, which are public, and stored as a Base64 image inside the database.

#### Tech Stack and Security Implementation: 
- The backend of this application is built with Java Spring Boot, leveraging its robust ecosystem for scalable and maintainable development. 
- For security, the application integrates Spring Security to handle authentication and authorization processes seamlessly. 
- To ensure data integrity and safeguard sensitive user information, the application uses JWT (JSON Web Tokens) for stateless authentication and Argon2 hashing for encrypting passwords and email addresses during account creation.
- The use of JWT tokens provides a secure and efficient way to manage user sessions without server-side storage. 
- When a user logs in or creates an account, the backend validates the credentials, generates a token, and returns it to the client. 
- This token is then used to authenticate subsequent requests, ensuring the user's identity and permissions are verified. 
- The token structure includes a payload that is signed using a secret key, making it tamper-resistant and suitable for distributed systems.
- For account creation, the application employs Argon2, a memory-intensive and secure password-hashing algorithm. 
- This method is recognized for its resistance to brute-force attacks and hardware-accelerated cracking attempts. 
- During registration, both the email and password are hashed using Argon2 before being stored in the database. 
- This ensures that even in the unlikely event of a database breach, sensitive user information remains protected.

#### Methods for Account Creation and Security Account Creation: 
- When a user signs up, their email and password are hashed using the Argon2PasswordEncoder, ensuring that plaintext credentials are never stored. 
-The hashed values are securely stored in the database along with other user details.

#### Login and JWT Token Generation: 
- During login, the users credentials are authenticated against the hashed values in the database. 
- Upon successful authentication, a JWT token is generated, embedding the users unique identifier and roles. 
- This token is signed using a secret key and sent to the client for use in subsequent requests.

#### Authorization: 
- The application includes a custom JwtRequestFilter that intercepts incoming HTTP requests. 
- This filter validates the provided JWT token, extracts the users details, and sets the authentication context. 
- This ensures that only authorized users can access protected endpoints.

#### Secure Communication: 
- All sensitive operations, including account creation, login, and data retrieval, occur over HTTPS to prevent interception of data in transit.
- This combination of modern frameworks, secure algorithms, and best practices ensures a high level of security and performance, making the application both user-friendly and robust against security threats.

## ExpoGo: 
- Expo Go is where RIPT is hosted
- Expo Go is free to download on the App Store. 
- Once downloaded you must create an account.
- Once the account is created, you can use a stable version of our app such as this one as of 1/3/2025:
    - exp://u.expo.dev/ea20e0cb-de85-4497-8c69-2a529bb4a3a4/group/15ab57b4-690a-43cc-9529-729a1e999870
- The link will open the App; where you can create a RIPT account.

#### How the link is generated:
- The link is generated with an "EAS" build.
- Here’s documentation from Expo Go that shows how to set it up (PART 1): https://docs.expo.dev/build/setup/ 
- The next step in the setup process is to look at the 'app.json' file, where you will see a Project ID. 
- If you want to create a new build (maybe after creating a feature) you must clear that ID and use 'eas update' in the command line to generate a new build + ID.

## Ideas for Future Teams:
#### Front end features:
- Implement graphs (backend already setup for this)
- Add body diagram page (backend would also need to be setup for this)
- Add "Dark Mode" button or color themes in settings
- Add a timer to "Start Workout" and "Live Workout" modals
- Allow for in-all cropping and positioning when selecting a profile picture
- Implement seeing multiple Days in nutrition tracker (backend already setup for this through getDayOfLoggedInUser/index endpoint)
- Make it easier on the UI side to create a new day, preferably one day gets its own Day object
- Automatically save notes when pressing back button
- Delete not trash can in header of note screen
- Add hover to notes with a small menu to delete it on the "My Notes" screen
- Add share icon to posts
- Pinned notes - these notes will appear at the top even if other notes are added or edited
- Make nutrition tracker feature faster. It is slower than other features and this is likely on the frontend side.
- Add your headshots to the team page!

#### Workouts backend:
- Add weight plates calculator (135 = 45lb bar + (2 * 45lb plates))
- PR Celebrations - Automatic detection and animation for frontend
- Add ability to add where you're currently working out, and give the user the option to make it public so others can know where you're working out

#### Social Post backend:
- Add the ability to see everyone's posts (on top of just seeing your friends' posts)
- Add hashtags and searches based on hashtags
- Add ability to add photos to posts

#### User Profile backend:
- Hide posts on profile screen unless they're on your friend's list

#### Nutrition tracker backend:
- Add more variables such as sugar, sodium, potassium, etc. to Food.java and Day.java total variables
- Add ability to take a picture of a nutrition label and fill those values when adding a Food

#### Other:
- Add moderation system for spam (admin vs. user accounts)
- Block/report account feature
- Private messaging feature
- Users shouldn't be able to add themselves as a friend
- Add offline mode
- Ript Stories
- Ript Reels

