import { useState, useEffect } from 'react'
import personService from './services/persons'

function App() {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()

    if (newName.trim() === '' || newNumber.trim() === '') return

    const existingPerson = persons.find(p => p.name.toLowerCase() === newName.toLowerCase())

    if (existingPerson) {
      if (window.confirm(`${newName} ya está agregado a la agenda, ¿deseas reemplazar el número viejo por el nuevo?`)) {
        const changedPerson = { ...existingPerson, number: newNumber }

        personService
          .update(existingPerson.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            alert(`La información de '${existingPerson.name}' ya fue eliminada del servidor`)
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
      }
      return
    }

    const personObject = {
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
  }

  const deletePersonOf = (id, name) => {
    if (window.confirm(`¿Estás seguro de borrar a ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
        })
        .catch(error => {
          alert(`La persona '${name}' ya había sido eliminada del servidor`)
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  return (
    <div>
      <h2>Agenda Telefónica</h2>

      <form onSubmit={addPerson}>
        <div>
          nombre: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          número: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">añadir</button>
        </div>
      </form>

      <h2>Números</h2>
      <ul>
        {persons.map(person => (
          <li key={person.id}>
            {person.name} - {person.number} {' '}
            <button onClick={() => deletePersonOf(person.id, person.name)}>eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App