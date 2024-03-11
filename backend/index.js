const express = require('express')
const app = express()
const cors = require('cors')
const db = require('./db')
const port = 4000

// body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.get('/', async(req, res) => {
    try {
        await db.queries.init();
        const response = await db.queries.getRecipes()
        res.json(response)
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error: Could not get all recipes');
    }
})

// add new recipe and ingredients
app.post('/', async (req, res) => {
    try {
        const { name, ingredients, directions, date } = req.body
        const response = await db.queries.addRecipe(name, directions, date)

        const recipeID = response.recipe_id;

        console.log(recipeID);

        // now insert ingredients
        const ingredientArray = ingredients.split('\n');

        console.log(ingredientArray)
        for (let i = 0; i < ingredientArray.length; i++) {
            var ingredient = ingredientArray[i];
            var result = db.queries.addIngredient(recipeID, ingredient);
        }
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error: Could not add recipe")
    }

})


// get a recipe by ID
app.get('/recipes/:id', async (req, res) => {
    try {
       const { id } = req.params;
       const response = await db.queries.getRecipe(id)

       // get the ingredients 
       const result = await db.queries.getIngredients(id)
       console.log(response)
       console.log(result)

       res.json(result);
    } catch (error) {
       console.error(error);
       res.status(500).send('Internal Server Error: Could not recipe');
    }
});

// update a recipe by ID
app.put('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, ingredients, directions, date } = req.body;
        const response = db.queries.updateRecipe(id, name, directions, date);
        
        const deleteRes = await db.queries.deleteIngredients(id);

        const ingredientArray = ingredients.split('\n');

        console.log(ingredientArray)
        for (let i = 0; i < ingredientArray.length; i++) {
            var ingredient = ingredientArray[i];
            var result = db.queries.addIngredient(id, ingredient);
        }

        res.json(response);
    } catch (error) {
       console.error(error);
       res.status(500).send('Internal Server Error: Could not update recipe');
    }
});

// delete a recipe by ID
app.delete('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.queries.deleteById(id);

        const response = await db.queries.deleteIngredients(id);
        console.log(result);
        console.log(response);



        res.json(response);
    } catch (error) {
       console.error(error);
       res.status(500).send('Internal Server Error: Could not delete recipe');
    }
});

app.listen(port, '0.0.0.0') 
console.log(`Running on http://0.0.0.0:${port}`)
