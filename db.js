const { Pool } = require('pg')

var pool

pool = new Pool({
    user: 'postgres',
    host: 'db',
    password: 'root'
})

const queries = {
    // recipe queries
    getRecipes: async function() {
        const res = await pool.query('SELECT * FROM recipes;')
        return res.rows
    },

    getRecipe: async function(id) {
        const query = 'SELECT * FROM recipes WHERE recipe_id = $1'
        const res =  await pool.query(query, [id]);
        return res.rows[0];
    },

    deleteById: async function(id) {
        const query = 'DELETE FROM recipes WHERE recipe_id = $1 RETURNING *'
        const res = await pool.query(query, [id])
        return res.rows[0];
    },

    addRecipe: async function(title, instructions, dateModified) {
        const query = 'INSERT INTO recipes(title, instructions, dateModified) VALUES ($1, $2, $3) RETURNING *;'
        const res = await pool.query(query, [title, instructions, dateModified])
        console.log(res.rows);
        return res.rows[0];
    },

    updateRecipe: async function(id, title, instructions, dateModified) {
        const query = 'UPDATE recipes SET title = $1, instructions = $2, dateModified = $3 WHERE recipe_id = $4 RETURNING *'
        const res = await pool.query(query,  [title, instructions, dateModified, id])
        return res.rows[0];
    },

    // ingredient queries
    getIngredients: async function(recipe_id) {
        const query = 'SELECT name FROM ingredients WHERE recipe_id = $1'
        const res =  await pool.query(query, [recipe_id]);
        return res.rows;
    },

    addIngredient: async function(recipe_id, name) {
        const query = 'INSERT INTO ingredients (recipe_id, name) VALUES ($1, $2)'
        const res = await pool.query(query, [recipe_id, name]);
    },

    deleteIngredients: async function(recipe_id) {
        const query = 'DELETE FROM ingredients WHERE recipe_id = $1 RETURNING *'
        const res = await pool.query(query, [recipe_id])
        return res.rows;
    },
    
    init: async function() {
        const recipeQuery = 'CREATE TABLE IF NOT EXISTS recipes (recipe_id SERIAL PRIMARY KEY,title VARCHAR(255) NOT NULL,instructions TEXT NOT NULL,dateModified TEXT NOT NULL)'
        const ingredientQuery = 'CREATE TABLE IF NOT EXISTS ingredients(ingredient_id SERIAL PRIMARY KEY, recipe_id INT REFERENCES recipes(recipe_id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL)'
        const recipeRes = await pool.query(recipeQuery)
        const ingredientRe = await pool.query(ingredientQuery)
    }
}

module.exports = { queries }
