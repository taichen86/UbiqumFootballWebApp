var vm = new Vue({

    el: '#vue-instance',
    data: {
        gameSelected: {},
        allPosts: [],
        gamePosts: [],
        allGames: [],
        currentUser : null
    },

    methods: {
        selectGame: function( id ){
            console.log( 'select game ' + id );
            this.gameSelected = this.allGames.find( game => { return game.id == id });
            // console.log( 'selected game: ' + this.gameSelected.id );
            showSection( gameSection );
        }
    },


})