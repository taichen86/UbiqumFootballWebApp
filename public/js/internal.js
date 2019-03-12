
let currentSectionID = 'games-schedule';
function navigateTo( id )
{
    console.log( 'go to page: ' + id );
    document.getElementById( currentSectionID ).style.display = 'none';
    document.getElementById( id ).style.display = 'block';
    currentSectionID = id;

}
