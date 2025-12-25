This React application :

#                                               **"reactJS_exam_2025"** 

serves as an online marketplace for video games. It facilitates operations like browsing the game catalog, managing user 
accounts, purchasing games, and other user-interactions. 
------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------
To run the project, you need to perform the following commands:
1. First, navigate to the main project folder. Then, to install all the necessary dependencies, execute the command:
npm install
2. The server must also be started. Navigate to the server folder within the main project folder. To start the server, 
execute the following command:
node .\server.js
3. After successfully installing the dependencies and starting the server, you can start the client-side application 
   by running:
npm start
------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------
Here is an overview of the project architecture and the key components of the application:

Context Providers:
- AuthProvider: Provides authentication functionality (log in, register, log out) and holds data relative to the 
  authenticated user.
- GameProvider: Handles actions relative to the games (search, create, edit, delete) and holds the collection of games.
- BoughtGamesProvider: Manages purchases and holds the list of games that the user has bought.

Core Components:
- Home:  Shows the latest, newest added games.
- Register/Login/Logout: user registration, login, and logout.
- UserDetails: Handling modification ability of user personal details(nationality, age, image, money).
- UserDetailsPage: Displaying the user details(nationality, age, image, money).
- Catalog: Displays the collection of games.
- DetailsGame: Shows the detailed view of a selected game.
- EditGame: Allows the modification of game details.
- CreateGame: Component facilitating the creation of new games.
- BoughtGames: Shows the list of games purchased by the user.

Basic components:
- Header - navigation component. It contains links to pages - Home, Catalog, Create Game, Details, Bought Games, Logout, 
  Register, and Login. It also displays the SearchForm component if the user is authenticated and is on the Catalog page.
- Footer - if a user is authenticated, it displays his email, otherwise, it shows "All rights reserved". 
- SearchForm - functional form component that allows users to search for games by title. 
- RouteGuard - component used to restrict user navigation based on their authentication status, which is stored in the 
  local storage. It allows navigation only if the user is authenticated; otherwise, it redirects to the login page.

Routing:
The application routing is handled by "react-router-dom" library.

Storage:
localStorage is used to persists user and game data across sessions.

Hooks and custom hooks:
- useService custom hook is used to make service calls. 
- useForm custom hook takes in initial form values and a submit handler function, and returns an object containing the 
  current form values, a change handler function for updating the form values, a submit handler function that calls the 
  provided onSubmitHandler function with the current form values, and a function to manually update the form values.
- useLocalStorage custom hook accepts a key and an initial value, and returns a state variable and a function to update 
  this state variable. Any changes to this state variable are also saved to localStorage under the provided key.
- other hooks from React (useState, useEffect, useContext) are used to manage state and side effects.

Services:
Services are used to interact with the backend and manage the data for users and games. They include:
- authService: returns an object with methods: login, register, logout, and details. These methods make authenticated 
  requests to the server to perform corresponding user authentication actions.
- boughtGamesService: returns an object with methods such as "getAll" and "create". "getAll" retrieves all games bought 
  by the current logged-in user, and "create" adds new game purchases to the server.
- comment Service: contains methods for handling comments related actions: "getAll" (fetches all the comments related to
  a game) and "create" (sends a request to the server to create a new comment).
- gameService: returns an object with several methods for handling game-related actions. The methods fetch 
  all games (getAll), fetch a particular game (getOne), create a new game (create), edit a game (edit), 
  add game comments (addComment), and delete a game (delete).
- requestFactory: this module provides a set of request methods (GET, POST, PUT, PATCH, DELETE) for making HTTP requests 
  to the server. It handles request options, authorization headers, and different response statuses.
- userService: returns an object with several methods such as "getUser", "additionalInfoByOwnerId", "update", and 
  "createInitialDetails" to manage user data. These methods make requests to the server to fetch user information, 
  create default details, update existing data, and handle cases when a resource does not exist.

I hope this gives you a solid overview. For more granular details, please refer to the inline documentation in the code.