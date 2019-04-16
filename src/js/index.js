//CONTROLLER
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
import Likes from './models/Likes';


/**Global state of the app (data in a given moment)
 *      -search object
 *      -current recipe object
 *      -shopping list object (cart)
 *      -liked and favorite recipes
 * Everything accesible from the state object
 */
const state = {};


//SEARCH CONTROLLER

const controlSearch = async () => {
    
    //1.Get query from view
    const query = searchView.getInput();
    //console.log(query);

    if (query) {
        //2. New search object and add to state
        state.search = new Search(query);

        //3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try{
            //4. Search for recipes
            await state.search.getResults();

            //5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        }
        catch(err){
            alert('Something went wrong with the search...');
            clearLoader();
        }
        
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//RECIPE CONTROLLER

const controlRecipe = async () => {

    //Get ID from URL
    const id = window.location.hash.replace('#', '');
    
    if(id){
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highligh selected recipe
        if(state.search){
            searchView.highlightSelected(id);
        }

        //Create recipe object
        state.recipe = new Recipe(id);

        //TESTING
        //window.r = state.recipe;

        try {
            //Get Recipe data       
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calc time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render Recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id));
        }
        catch(err){
            console.log(err);
            alert('Error processing recipe');
        }
    }       
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//LIST CONTROLLER
const controlList = () => {
    if(!state.list) state.list = new List();
    
    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}
//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {

    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItem(id);
    }
    // Handle the count update
    else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

//LIKE CONTROLLER
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    //user has not yet liked recipe
    if(!state.likes.isLiked(currentID)){
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );  
        //toggle like button
        likesView.toggleLikeBtn(true);
        //add like to UI list
        likesView.renderLike(newLike);
        
    } //user has already liked the recipe
    else{
        //Remove like from the state
        state.likes.deleteLike(currentID);
        //toggle like button
        likesView.toggleLikeBtn(false);
        //remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();  
    //restore liked
    state.likes.readStorage();
    //toggle like menu
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    //render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


//handling recipe button clicks
//inc or dec servings
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if (e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if (e.target.matches('.recipe__btn--add', '.recipe__btn--add *')){
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();  
    }
});