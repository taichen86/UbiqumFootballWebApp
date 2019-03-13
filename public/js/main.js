var currentUser;

let signInButton = document.getElementById( 'sign-in-button' );
let signOutButton = document.getElementById( 'sign-out-button' );
let navMessagesButton = document.getElementById( 'nav-messages-button' );

function GoogleSignIn()
{
    console.log( 'google sign in...' );
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log( 'result user ' + result.user );
      // document.getElementById( 'username' ).innerHTML = result.user.displayName;

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
      console.log( 'login error: ' + error );
      document.getElementById( 'error-text' ).innerHTML = error;
      document.getElementById( 'error-text' ).style.display = 'block';

    });

    
}


function GoogleSignOut()
{
    console.log( 'google sign out...' );
    ShowSignedOutPage();

    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      console.log( 'sign out successful' );

    }).catch(function(error) {
      // An error happened.
      console.log( 'sign out error ' + error );
      document.getElementById( 'error-text' ).innerHTML = error;
      document.getElementById( 'error-text' ).style.display = 'block';

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
    vm.messagesToShow = [];
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
  document.getElementById( 'error-text' ).style.display = 'none';
  console.log( 'hide error text' );

  if( user ) 
  {

  // We ignore token refresh events.
    if( currentUser && user.uid === currentUser.uid ){
        console.log( 'same user' );
        return;
    }

    currentUser = user;
    ShowSignedInPage();

    writeUserData( user.uid, user.displayName, user.email, user.photoURL );
    // GetPosts();

  } else {
    // Set currentUID to null.
    currentUser = null;
    // Display the splash page where you can sign-in.
    console.log( 'user null' );
    // document.getElementById( 'error-text' ).innerHTML = 'no user found';
    // document.getElementById( 'error-text' ).style.display = 'block';

  }
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
  
    vm.gamesToShow = localGameData.games;
    console.log( vm.gamesToShow );


    signInButton.addEventListener( 'click', GoogleSignIn );
    signOutButton.addEventListener( 'click', GoogleSignOut );
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(onAuthStateChanged);

    toggleSignInOutButtons();


}, false);

function toggleSignInOutButtons()
{
    if( currentUser ){
        document.getElementById('sign-out-button').style.display = 'block';
        document.getElementById('sign-in-button').style.display = 'none';
    }else{
        document.getElementById('sign-out-button').style.display = 'none';
        document.getElementById('sign-in-button').style.display = 'block';
    }

}

var currentSectionID = 'games-schedule';
function navigateTo( id )
{
    console.log( 'go to page: ' + id );
    document.getElementById( 'navbar-main' ).classList.add( "fixed-bottom" );
    document.getElementById( currentSectionID ).style.display = 'none';
    document.getElementById( id ).style.display = 'block';
    currentSectionID = id;
}

function goToMessagesPage()
{
    
    navigateTo( 'chat-messages' );
    document.getElementById( 'navbar-main' ).classList.remove( "fixed-bottom" );

    if( currentUser ) // SIGNED IN
    {
        ShowSignedInPage();

    }else{ // SIGNED OUT

      ShowSignedOutPage();

    }
}

function ShowSignedInPage()
{
    console.log( 'ShowSignedInPage' );
    document.getElementById( 'signed-out-text' ).style.display = 'none';
    document.getElementById( 'message-input-bar' ).style.display = 'inline-flex';
    toggleSignInOutButtons();
    // document.getElementById( 'username' ).innerHTML = currentUser.displayName;
}

function ShowSignedOutPage()
{
    console.log( 'ShowSignedOutPage' );
    vm.messagesToShow = [];
    document.getElementById( 'message-input-bar' ).style.display = 'none';
    toggleSignInOutButtons();
    // document.getElementById( 'username' ).innerHTML = '';
    document.getElementById( 'signed-out-text' ).style.display = 'block';
    document.getElementById( 'navbar-main' ).st


}

