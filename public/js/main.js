// var currentUser = null;

let navBar = document.getElementById( 'navbar' );

let alertBar = document.getElementById( 'error-text' );

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

let allPostsTab = document.getElementById( 'all-posts-tab' );
let gamePostsTab = document.getElementById( 'game-posts-tab' );
let allPostsContent = document.getElementById( 'all-posts-content' );
let gamePostsContent = document.getElementById( 'game-posts-content' );

let allPostsDBRef = null; 
let gamePostsDBRef = null; 





window.addEventListener( 'load', function() {
  
    signInButton.addEventListener( 'click', GoogleSignIn );
    signOutButton.addEventListener( 'click', GoogleSignOut );
    firebase.auth().onAuthStateChanged( onAuthStateChanged );

    window.addEventListener( "orientationchange", adjustNavOffsetSpacing );

    scheduleBtn.addEventListener( 'click', clickSchedulePage );
    gameBtn.addEventListener( 'click', clickGamePage );
    messagesBtn.addEventListener( 'click', clickMessagesPage );

     allPostsTab.addEventListener( 'click', function(){
        getAllPosts();
        showAllPosts();
     }  );
     gamePostsTab.addEventListener( 'click', function(){
         getGamePosts();
         showGamePosts();
     } );


}, false);


function clickMessagesPage(){
    showSection( messagesSection );
    stickNavBarToBottom( false );
    selectMessagesTab();
    adjustNavOffsetSpacing();
}

function clickGamePage(){
    showSection( gameSection );
    stickNavBarToBottom( true );
    adjustNavOffsetSpacing();
}

function clickSchedulePage(){
    showSection( scheduleSection );
    stickNavBarToBottom( true );
    adjustNavOffsetSpacing();
}

function initialize()
{
    vm.allGames = localGameData.games;
    // console.log( vm.allGames );

    // show correct page
    const page = window.location.hash.substr(1);
    console.log( 'current page ' + page );
    showSection( scheduleSection );
    adjustNavOffsetSpacing();
    stickNavBarToBottom( true );
}

function showSection( sectionToShow )
{
    pageSections.forEach( section => { section.style.display = 'none'; } )
    sectionToShow.style.display = 'block';
}

function toggleSignInOutButtons()
{
    console.log( 'toggle ' + vm.currentUser );
    if( vm.currentUser == null || vm.currentUser.uid == undefined ){
        console.log( 'show SIGN IN' );
        signInButton.style.display = 'block';
        signOutButton.style.display = 'none';
    }else{
        console.log( 'show SIGN OUT' );
        signOutButton.style.display = 'block';
        signInButton.style.display = 'none';
    }
}

function stickNavBarToBottom( toBottom )
{
    if( toBottom ) {
        navBar.classList.remove( 'fixed-top' );
        navBar.classList.add( 'fixed-bottom' );
    }else{
        navBar.classList.remove( 'fixed-bottom' );
        navBar.classList.add( 'fixed-top' );
    }
    navBar.style.display = 'block';
}


function adjustNavOffsetSpacing()
{
    Array.from( document.getElementsByClassName( 'nav-offset-spacing' ) ).forEach( element => {
        element.style.height = ( navBar.offsetHeight + 10 ) + 'px';
    })
    
}

function selectGame( gameID )
{
    console.log( 'select game ' + gameID );

}

function selectMessagesTab()
{
    // if signed in...
    if( vm.currentUser == null || vm.currentUser.uid == undefined ){
        console.log( 'no user ??? ' + vm.currentUser );
    } 

    console.log( 'show messages page ' + vm.gameSelected.id );
    if( vm.gameSelected.id != undefined ){
        getGamePosts();
        showGamePosts();
        document.getElementById( "game-posts-tab" ).innerHTML = "Game " + vm.gameSelected.id;
    }else{
        getAllPosts();
        showAllPosts();
        document.getElementById( "game-posts-tab" ).innerHTML = "Game Posts";

    }
}

function getAllPosts()
{
    console.log( 'get all posts' );
    allPostsDBRef = firebase.database().ref( '/posts/' );
        allPostsDBRef.on( 'value', function(snapshot) {
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

function showAllPosts()
{
    console.log( 'show all posts ' + vm.allPosts.length );
    gamePostsTab.classList.remove( "active" );
    allPostsTab.classList.add( "active" );
    gamePostsContent.style.display = "none";
    allPostsContent.style.display = 'block'
}



function getGamePosts()
{
    gamePostsDBRef = firebase.database().ref( '/game-posts/' + vm.gameSelected.id );
    gamePostsDBRef.on( 'value', function(snapshot) {
        updateGamePosts( snapshot );
    });

}

function updateGamePosts( snapshot )
{
    console.log( 'game posts snpashot val --> ' + snapshot.length );
    vm.gamePosts = [];
    snapshot.forEach( function(childSnapShot){
        console.log( childSnapShot.key);
        console.log( childSnapShot.val());
        vm.gamePosts.push( childSnapShot.val() );
    } )
    
}

function showGamePosts()
{
    console.log( 'show game posts' );
    allPostsTab.classList.remove( "active" );
    gamePostsTab.classList.add( "active" );
    allPostsContent.style.display = "none";
    gamePostsContent.style.display = 'block'
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
      alertBar.innerHTML = error;
      alertBar.display = 'block';

    });

    
}


function GoogleSignOut()
{
    console.log( 'google sign out...' );
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      console.log( 'sign out successful' );
    }).catch(function(error) {
      // An error happened.
      console.log( 'sign out error ' + error );
      alertBar.innerHTML = error;
      alertBar.style.display = 'block';
    });
}

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged( user ) {
    console.log( 'onAuthStateChanged ' + user );
    console.log( 'current ' + vm.currentUser );
    alertBar.style.display = 'none';

    if( user ) 
    {
  
    // We ignore token refresh events.
      if( vm.currentUser && user.uid === vm.currentUser.uid ){
          console.log( 'same user' );
          return;
      }
  
      console.log( 'ASSIGN USER' );
      vm.currentUser = user;
      writeUserData( user.uid, user.displayName, user.email, user.photoURL );
          
      // if signed in, show messages
      console.log( 'page ' + window.location.hash.substr(1) );
        if( window.location.hash.substr(1) == "chat-messages" ){
            selectMessagesTab();
        }

  
    } else {
        vm.currentUser = null;
      console.log( 'user null' );
    }


    toggleSignInOutButtons();

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


function onOrientationChanged() {
    console.log( "onOrientationChanged " );

  }




initialize();

