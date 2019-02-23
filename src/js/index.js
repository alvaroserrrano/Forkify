//CONTROLLER
import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements} from './views/base';

/**Global state of the app (data in a given moment)
 *      -search object
 *      -current recipe object
 *      -shopping list object (cart)
 *      -liked and favorite recipes
 * Everything accesible from the state object
 */
const state = {};

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

        //4. Search for recipes
        await state.search.getResults();

        //5. Render results on UI
        searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});
