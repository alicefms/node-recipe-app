const express = require('express')
const { getDbConnection } = require('./database')

const router = express.Router()

router.get('/', (req, res) => {
	res.render('home', { title: 'Recipe App' })
})

router.get('/recipes', async (req, res) => {
	const db = await getDbConnection()
	const recipes = await db.all('SELECT * FROM recipes')
	res.render('recipes', { recipes })
})

router.get('/recipes/:id', async (req, res) => {
	const db = await getDbConnection()
	const recipeId = req.params.id
	const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [recipeId])
	res.render('recipe', { recipe })
})

router.post('/recipes', async (req, res) => {
const db = await getDbConnection()
const { title, ingredients, method, description } = req.body
// Garante que description sempre existe
await db.run('INSERT INTO recipes (title, description, ingredients, method) VALUES (?, ?, ?, ?)', [
  title,
  description || '',
  ingredients,
  method
])
res.redirect('/recipes')
})

router.post('/recipes/:id/edit', async (req, res) => {
	const db = await getDbConnection()
	const recipeId = req.params.id
	const { title, ingredients, method } = req.body
	await db.run('UPDATE recipes SET title = ?, ingredients = ?, method = ? WHERE id = ?', [
		title,
		ingredients,
		method,
		recipeId,
	])
	res.redirect(`/recipes/${recipeId}`)
})

// Deletar receita
router.post('/recipes/:id/delete', async (req, res) => {
	const db = await getDbConnection()
	const recipeId = req.params.id
	await db.run('DELETE FROM recipes WHERE id = ?', [recipeId])
	res.redirect('/recipes')
})

// Get a random recipe
router.get('/recipes/random', async (req, res) => {
	const db = await getDbConnection()
	const randomRecipe = await db.get('SELECT * FROM recipes ORDER BY title LIMIT 1')
	if (randomRecipe) {
		res.render('recipe', { recipe: randomRecipe })
	} else {
		res.status(404).send('No recipes found')
	}
})
module.exports = router
