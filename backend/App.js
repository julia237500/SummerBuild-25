import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';


import React, { useEffect, useState } from "react";
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";

const API_URL = "http://localhost:5000/api/recipes";

export default function RecipeApp() {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({ title: "", ingredients: "", instructions: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setRecipes(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setEditingId(null);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setFormData({ title: "", ingredients: "", instructions: "" });
    fetchRecipes();
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setFormData({ title: recipe.title, ingredients: recipe.ingredients, instructions: recipe.instructions });
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchRecipes();
  };

  return (
    <Container className="p-4">
      <h1 className="text-center mb-4">Recipe Organizer</h1>

      <Form onSubmit={handleSubmit} className="mb-5">
        <Row>
          <Col md={4}><Form.Control name="title" placeholder="Title" value={formData.title} onChange={handleChange} required /></Col>
          <Col md={4}><Form.Control name="ingredients" placeholder="Ingredients" value={formData.ingredients} onChange={handleChange} required /></Col>
          <Col md={4}><Form.Control name="instructions" placeholder="Instructions" value={formData.instructions} onChange={handleChange} required /></Col>
        </Row>
        <Button type="submit" className="mt-3">{editingId ? "Update Recipe" : "Add Recipe"}</Button>
      </Form>

      <Row xs={1} md={2} lg={3} className="g-4">
        {recipes.map((recipe) => (
          <Col key={recipe.id}>
            <Card>
              <Card.Body>
                <Card.Title>{recipe.title}</Card.Title>
                <Card.Text><strong>Ingredients:</strong> {recipe.ingredients}</Card.Text>
                <Card.Text><strong>Instructions:</strong> {recipe.instructions}</Card.Text>
                <Button variant="warning" className="me-2" onClick={() => handleEdit(recipe)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(recipe.id)}>Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
