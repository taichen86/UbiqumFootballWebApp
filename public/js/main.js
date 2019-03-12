var currentUser;

let signInButton = document.getElementById( 'sign-in-button' );
let signOutButton = document.getElementById( 'sign-out-button' );


function GoogleSignIn()
{
    console.log( 'google sign in...' );
    let provider = new firebase.auth.GoogleAuthProvider();
    console.log( 'provider: ' + provider );

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log( 'result user ' + result.user );
      document.getElementById( 'user-id-text' ).innerHTML = result.user.displayName;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });

    navigateTo( 'chat-messages' );
    GetPosts();
}

function GoogleSignOut()
{
    console.log( 'google sign out...' );
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      console.log( 'sign out successful' );
      document.getElementById( 'signed-out-text' ).innerHTML = "SIGNED OUT";

    }).catch(function(error) {
      // An error happened.
      console.log( 'sign out error ' + error );
      document.getElementById( 'error-text' ).innerHTML = error;

    });
}


function GetPosts()
{
    console.log( 'get posts' );
      let allPosts = firebase.database().ref('posts');
      allPosts.on( 'value', function(snapshot) {
          updateAllPosts( snapshot );
    });
}

function updateAllPosts( snapshot )
{
    console.log( 'snpashot val --> ' + snapshot );
    snapshot.forEach( function(childSnapShot){
        console.log( childSnapShot.key);
        console.log( childSnapShot.val());
        vm.messagesToShow.push( childSnapShot.val() );
    } )
    
}


function writeUserData( userId, name, email, imageUrl) 
{
    firebase.database().ref('users/' + userId).set({
      username: name,
      email: email,
      profile_picture : imageUrl
    });
}


/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged( user ) {
  console.log( 'onAuthStateChanged ' + user );

  if( user ) 
  {
    document.getElementById( 'signed-out-text' ).innerHTML = "";

  // We ignore token refresh events.
    if( currentUser && user.uid === currentUser.uid ){
        console.log( 'same user' );
        return;
    }

    currentUser = user;
    writeUserData( user.uid, user.displayName, user.email, user.photoURL );

  } else {
    // Set currentUID to null.
    currentUser = null;
    // Display the splash page where you can sign-in.
    console.log( 'user null' );
    document.getElementById( 'user-id-text' ).innerHTML = 'USER IS NULL';  }
}


function PrepareNewPost()
{
    const message = document.getElementById( 'message-input' ).value;
    console.log( 'post message...' + message );
    console.log( currentUser );
    writeNewPost( currentUser.uid, currentUser.displayName, currentUser.photoURL, message );
    document.getElementById( 'message-input' ).value = '';
}

function writeNewPost( uid, username, picture, message ) 
{
    // A post entry.
    let postData = 
    {
      uid: uid,
      author: username,
      authorPic: picture,
      body: message
    };
    console.log( 'post data: ' + postData.uid );
    console.log( 'post data: ' + postData.author );
    console.log( 'post data: ' + postData.authorPic );
    console.log( 'post data: ' + postData.body );

    // Get a key for a new Post.
    const newPostKey = firebase.database().ref().child('posts').push().key;
    console.log( 'new post key: ' + newPostKey );

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/posts/' + newPostKey] = postData;
    updates['/user-posts/' + uid + '/' + newPostKey] = postData;

    return firebase.database().ref().update( updates );
}

function writeUserData( userId, name, email, imageUrl ) {
  console.log( 'writeUserData: ' + name );
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}

// Bindings on load.
window.addEventListener( 'load', function() {
  // Bind Sign in button.
  // signInButton.addEventListener( 'click', function() {
  //   var provider = new firebase.auth.GoogleAuthProvider();
  //   firebase.auth().signInWithPopup(provider);
  // });

  // Bind Sign out button.
  // signOutButton.addEventListener( 'click', function() {
  //   firebase.auth().signOut();
  // });

  signInButton.addEventListener( 'click', GoogleSignIn );
  signOutButton.addEventListener( 'click', GoogleSignOut );
  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  // Saves message on form submit.
  // messageForm.onsubmit = function(e) {
  //   e.preventDefault();
  //   var text = messageInput.value;
  //   var title = titleInput.value;
  //   if (text && title) {
  //     newPostForCurrentUser(title, text).then(function() {
  //       myPostsMenuButton.click();
  //     });
  //     messageInput.value = '';
  //     titleInput.value = '';
  //   }
  // };

  // Bind menu buttons.
  // recentMenuButton.onclick = function() {
  //   showSection(recentPostsSection, recentMenuButton);
  // };
  // myPostsMenuButton.onclick = function() {
  //   showSection(userPostsSection, myPostsMenuButton);
  // };
  // myTopPostsMenuButton.onclick = function() {
  //   showSection(topUserPostsSection, myTopPostsMenuButton);
  // };
  // addButton.onclick = function() {
  //   showSection(addPost);
  //   messageInput.value = '';
  //   titleInput.value = '';
  // };
  // recentMenuButton.onclick();
}, false);