var vm = new Vue({

    el: '#vue-instance',
    data: {
        gameSelected: {},
        messagesToShow: [],
        allGames: []
    },

    methods: {
        goToGame: function( id ){
            console.log( 'go to game ' + id );
            navigateTo( 'game-page-full' );
            this.gameSelected = this.allGames.find( game => { return game.id == id });
            // console.log( 'selected game: ' + this.gameSelected.id );
        }
    },

    // created: function( )
    // {
    //     console.log( 'created' );
    //     this.gamesToShow = localGameData.games;
    //     console.log( this.gamesToShow );
    // },

    // mounted: function () {
    //     console.log( 'mounted' );

    //   }

})