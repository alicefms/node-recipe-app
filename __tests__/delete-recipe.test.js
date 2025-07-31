const request = require('supertest')
const express = require('express')
const routes = require('../src/routes')
const { getDbConnection } = require('../src/database')

let app

beforeAll(async () => {
  app = express()
  app.use(express.urlencoded({ extended: false }))
  app.use('/', routes)
})

describe('DELETE /recipes/:id/delete', () => {
  let db, recipeId
  beforeAll(async () => {
    db = await getDbConnection()
    await db.run('DELETE FROM recipes')
    const { lastID } = await db.run('INSERT INTO recipes (title, ingredients, method) VALUES (?, ?, ?)', [
      'Receita Teste',
      'Ingrediente Teste',
      'Método Teste',
    ])
    recipeId = lastID
  })

  it('deleta uma receita existente e redireciona', async () => {
    const res = await request(app)
      .post(`/recipes/${recipeId}/delete`)
      .send()
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/recipes')
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [recipeId])
    expect(recipe).toBeUndefined()
  })

  it('não falha ao tentar deletar uma receita inexistente', async () => {
    const res = await request(app)
      .post(`/recipes/99999/delete`)
      .send()
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/recipes')
  })
})
