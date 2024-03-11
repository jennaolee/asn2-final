const express = require('express')
const app = express()
const cors = require('cors')
// const waitOn = require('wait-on');


// const { Pool } = require('pg')

// var pool

// pool = new Pool({
//     user: 'postgres',
//     host: 'db',
//     password: 'root'
// })

const port = 3000

const db = require('./db')
// const helper = require('./helper')




// body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())


// // create tables
// async function initTables() {
//     try {
//         await db.queries.init();
//         console.log('Tables created successfully');
//     } catch (error) {
//         console.error('Error creating tables:', error);
//     }

// }

// // await connection to port
// async function init() {
//     await waitOn({
//         resources: ['tcp:localhost:5432'],
//     });
//     await initTables();
// }

// init();


app.get('/', async(req, res) => {
    // db.queries.init()
    // res.send('db was initiated!')
    try {
        await db.queries.init();
        const response = await db.queries.getRecipes()
        res.json(response)
        // res.send('Tables created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error: Could not get all recipes');
        // res.status(500).send('Error creating tables:', error);
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

        // const ingredientObject = JSON.parse(ingredients)
        // const ingredientsArray = ingredientObject.ingredients;

        console.log(ingredientArray)
        for (let i = 0; i < ingredientArray.length; i++) {
            var ingredient = ingredientArray[i];
            var result = db.queries.addIngredient(recipeID, ingredient);
        }


        // const ingredientValues = ingredients.map(ingredient => [recipeId, ingredient.name]);
        // const res = await db.addIngredient(ingredientValues);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error: Could not add recipe")
    }

})

// get all recipes
// app.get('/recipes', async (req, res) => {
//     try {
//         const response = await db.queries.getRecipes()
//         // res.json(response.rows);
//         res.json(response)
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error: Could not get all recipes');
//     }
// })

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
        // const addRes = await db.queries.addIngredient

        const ingredientArray = ingredients.split('\n');

        // const ingredientObject = JSON.parse(ingredients)
        // const ingredientsArray = ingredientObject.ingredients;

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
