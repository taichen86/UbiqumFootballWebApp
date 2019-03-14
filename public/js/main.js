// var currentUser = null;

let navBar = document.getElementById( 'navbar' );

let signInButton = document.getElementById( 'sign-in-button' );
let signOutButton = document.getElementById( 'sign-out-button' );

let scheduleBtn = document.getElementById( 'nav-schedule' );
let gameBtn = document.getElementById( 'nav-game' );
let messagesBtn = document.getElementById( 'nav-messages' );
let allNavBtns = [ scheduleBtn, gameBtn, messagesBtn ];


let scheduleSection = document.getElementById( 'schedule-section' );
let gameSection = document.getElementById( 'game-section' );
let messagesSection = document.getElementById( 'messages-section' );
let pageSections = [ scheduleSection, gameSection, messagesSection ];



window.addEventListener( 'load', function() {
  
    signInButton.addEventListener( 'click', GoogleSignIn );
    signOutButton.addEventListener( 'click', GoogleSignOut );
    firebase.auth().onAuthStateChanged(onAuthStateChanged);

    scheduleBtn.addEventListener( 'click', function(){ showSection( scheduleSection ); } );
    gameBtn.addEventListener( 'click', function(){ showSection( gameSection ); } );
    messagesBtn.addEventListener( 'click', function(){ showSection( messagesSection ); } );

}, false);


function initialize()
{
    vm.allGames = localGameData.games;
    // console.log( vm.allGames );
    showSection( scheduleSection );
    
}

function showSection( sectionToShow )
{
    pageSections.forEach( section => { section.style.display = 'none'; } )
    sectionToShow.style.display = 'block';
}

function showSelectedGame()
{

}


function toggleSignInOutButtons()
{
    if( vm.currentUser ){
        console.log( 'show SIGN IN' );
        signInButton.style.display = 'block';
        signOutButton.style.display = 'none';
    }else{
        console.log( 'show SIGN OUT' );
        signOutButton.style.display = 'none';
        signInButton.style.display = 'block';
    }
}


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

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged( user ) {
    console.log( 'onAuthStateChanged ' + user );
    document.getElementById( 'error-text' ).style.display = 'none';
    toggleSignInOutButtons();

  
    if( user ) 
    {
  
    // We ignore token refresh events.
      if( vm.currentUser && user.uid === vm.currentUser.uid ){
          console.log( 'same user' );
          return;
      }
  
      vm.currentUser = user;
      ShowSignedInPage();
  
      writeUserData( user.uid, user.displayName, user.email, user.photoURL );
      GetAllPosts();
  
    } else {
      // Set currentUID to null.
      vm.currentUser = null;
      // Display the splash page where you can sign-in.
      console.log( 'user null' );
  
    }
  }
  


function GetAllPosts()
{
      let allPosts = firebase.database().ref( '/posts/' );
      allPosts.on( 'value', function(snapshot) {
          updateAllPosts( snapshot );
    });
}

function updateAllPosts( snapshot )
{
    console.log( 'all posts snpashot val --> ' + snapshot );
    vm.allPosts = [];
    snapshot.forEach( function(childSnapShot){
        // console.log( childSnapShot.key);
        // console.log( childSnapShot.val());
        vm.allPosts.push( childSnapShot.val() );
    } )
    
}

function GetGamePosts()
{
    console.log( 'GetGamePosts ' + vm.gameSelected );
    if( vm.gameSelected.id == undefined )
    {
        console.log( 'no game selected' );
        return;
    }
    let gamePosts = firebase.database().ref( '/game-posts/' + vm.gameSelected.id );
    gamePosts.on( 'value', function(snapshot) {
      updateGamePosts( snapshot );
    });
}

function updateGamePosts( snapshot )
{
    console.log( 'game posts snpashot val --> ' + snapshot );
    vm.gamePosts = [];
    snapshot.forEach( function(childSnapShot){
        // console.log( childSnapShot.key);
        // console.log( childSnapShot.val());
        vm.gamePosts.push( childSnapShot.val() );
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




function PrepareNewPost()
{
    const message = document.getElementById( 'message-input' ).value;
    console.log( 'post message...' + message );
    console.log( vm.currentUser );
    writeNewPost( vm.currentUser.uid, vm.currentUser.displayName, vm.currentUser.photoURL, message , vm.gameSelected.id );
    document.getElementById( 'message-input' ).value = '';
}

function writeNewPost( uid, username, picture, message, gameid = '000' ) 
{
    // A post entry.
    let postData = 
    {
        uid: uid,
        author: username,
        authorPic: picture,
        body: message,
        gameid: gameid
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
    updates['/game-posts/' + gameid + '/' + newPostKey] = postData;

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






// function goToMessagesPage()
// {
    
//     navigateTo( 'chat-messages' );
//     document.getElementById( 'navbar-main' ).classList.remove( "fixed-bottom" );

//     if( currentUser ) // SIGNED IN
//     {
//         ShowSignedInPage();

//     }else{ // SIGNED OUT

//       ShowSignedOutPage();

//     }
// }

function ShowSignedInPage()
{
    console.log( 'ShowSignedInPage' );
    document.getElementById( 'signed-out-text' ).style.display = 'none';
    // toggleSignInOutButtons();
    document.getElementById( 'chat-signed-in-content' ).style.display = 'block';
    
    if( vm.gameSelected.id != undefined )
    {
        console.log( 'game selected: ' + vm.gameSelected.id );
        document.getElementById( 'message-input-bar' ).style.display = 'inline-flex';
        document.getElementById( 'game-posts' ).classList.add( "active" );
        document.getElementById( 'all-posts' ).classList.remove( "active" );
    }else{
        document.getElementById( 'message-input-bar' ).style.display = 'none';
        document.getElementById( 'all-posts' ).classList.add( "active" );
        document.getElementById( 'game-posts' ).classList.remove( "active" );


    }
}

function ShowSignedOutPage()
{
    console.log( 'ShowSignedOutPage' );
    vm.messagesToShow = [];
    document.getElementById( 'message-input-bar' ).style.display = 'none';
    // toggleSignInOutButtons();
    document.getElementById( 'signed-out-text' ).style.display = 'block';
    document.getElementById( 'chat-signed-in-content' ).style.display = 'none';

}



initialize();

