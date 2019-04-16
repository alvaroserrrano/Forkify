import axios from 'axios';
import {key, proxy} from '../config';

export default class Recipe {
    
    constructor(id){
        this.id = id;
    }

    async getRecipe () {
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }
        
        catch(error){
            console.log(error);
            alert('Something went wrong');
        }
    }

    //Assume 15 minutes for every 3 ingredientes
    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15; 
    }

    //Default 4 servings
    calcServings() {
        this.servings = 4;
    }

    //Since each ingredient is given in a different format
    parseIngredients() {
        const unitsLong = ['tablespoon', 'tablespoons', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound']; 
        const newIngredients = this.ingredients.map(el => {
            //1. Uniform and standard units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            //2. Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

            //3. Parse: count, unit and ingredient
            const arrIng = ingredient.split(' ');

            //find index where unit is locate.
            //sometimes we have only a number, other times several or nothing
            //Ex 1 --> 1 1/2
            //Ex 2 --> 1
            //Ex 3 --> ' '
            //We can´t use indexOf because we do not know the position of the unit
            //Use findIndex (pass callback func)
            const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2));

            //Return this object
            let objIng;
            if(unitIndex > -1){
                //there is a unit
                //Ex 4 1/2 cups, arrCount [4, 1/2] --> eval -->4.5
                //Ex 4 cups, arrCount [4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if(arrCount.length === 1 ){
                    count = eval(arrIng[0].replace(' - ', ' + '));
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join(' + '));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
            }else if (parseInt(arrIng[0], 10)) {
                //there is no unit but 1st element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient : arrIng.slice(1).join(' ')
                }
            }else if (unitIndex === -1){
                //there is no unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }

}