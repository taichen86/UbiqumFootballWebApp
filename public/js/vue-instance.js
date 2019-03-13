var vm = new Vue({

    el: '#vue-instance',
    data: {
        gameSelected: {},
        gamesToShow: [],
        messagesToShow: []
    },

    methods: {
        goToGame: function( id ){
            console.log( 'go to game ' + id );
            navigateTo( 'game-page-full' );
            this.gameSelected = this.gamesToShow.find( game => { return game.id == id });
            console.log( 'selected game: ' + this.gameSelected.id );
        }
    }

})