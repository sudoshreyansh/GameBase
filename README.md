# GameBase

GameBase, a in-browser gaming website project for WoC 3.0. <br>
Hosted Project: [https://gamebase-94ec7.web.app/](https://gamebase-94ec7.web.app/)

Apart from a normal gaming website, it also has some additional features.

## Features
* **OAuth based login:** Instead of the traditional username and password login system, this application implements OAuth based signup and login which makes it really easy, quick and hassle-free to login to the website
* **Device Specific Games:** The admin panel lets you choose the device on which the game is available and displays games based on the device the user is using. The users can change their device from the nav menu if incorrectly detected.
* **Powerful Search:** Since Firestore does not allow very complex queries, this application uses a particular algorithm to make sure that the search remains helpful and fast no matter how large the database is. This application matches the search query with the games' names word by word.
* **Data Collection:** Data about the amount of time spent by a user playing a particular game is recorded in the database. This data helps the application identify the top games which users are liking.
* **Full Screen Mode:** Some games are developed with the full-screen mode in mind, which leads to problems. For example, in some games, using arrow keys might lead to scrolling. Since the developer expects the game to be played in full-screen mode, the developer might not have created any fix for the issue. For such problems and for a better gaming experience, a full-screen button is placed on the top right that plays the game on full-screen mode, preventing any such problems.
