const { Router } = require('express');
const axios = require ('axios');
const router = Router();
const {Pokemon, Types} = require('../db');
const {getAllPokemons} = require ('../funciones.js/functions')


// ---------------------

router.get('/pokemons', async (req, res) => {
    const { name } = req.query 
    try {
        const pokemonsTotal = await getAllPokemons()
        if (name) {
            const pokemonName = pokemonsTotal.filter(
                e => e.name.toLowerCase().includes(name.toLowerCase())) // usamos includes porque getAllPokemons retorna un array con objetos, yo quiero hacerle un filter a la variable donde tengo dicho array (pokemonsTotal) y quedarme solo con el objeto cuyo nombre coincida con el filter.
           pokemonName.length ?
           res.status(200).send(pokemonName) : 
           res.status(200).send(['No se encuentra el personaje con dicho nombre'])
        }
        else {
            res.status(200).send(pokemonsTotal)
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})


// --------------

router.get('/pokemons/:id', async (req, res, next) => {
    const {id} = req.params
    try {
    getAllPokemons()
    .then(data => { 
        let pokeId = data.filter((e) => {
            return e.id == id
        })
        console.log(data)
    pokeId.length ?
    res.status(200).json(pokeId) : 
    res.status(404).send('No se encuentra el pokemon con dicho id')
    })
        }
     catch (error) {
        next('no se encontro el pokemon con ese ID', error)
    }
})

// ----------------

router.get ('/types', async (req, res) => {
    const typesInfo =  await axios.get('https://pokeapi.co/api/v2/type')
    
    const typesMap = typesInfo.data.results.map(e => e.name)
         
    typesMap.forEach(i => {
     //   console.log(i)
        Types.findOrCreate({
            where: {name: i}
        })
    });
    const allTypes = await Types.findAll();
    res.send(allTypes)
})

// -------------

router.post('/pokemons', async (req, res) => {
    try {
        const { name, hp, attack, defense, speed,
            height, weight, created, types, image
        } = req.body
        const pokemon = await Pokemon.create({name, hp, attack, defense, speed, height, weight, created, image 
        })
        const typesDb = await Types.findAll({
            where: {name: types}
        })
        pokemon.addTypes(typesDb)
        res.status(200).send('Personaje creado con exito, sos un crack!!')
    } catch (error) {
        res.status(400).send(error)
    }
})


// Route DELETE

router.delete('/pokemons/:id', async (req, res) =>{
     try {
         const {id} = req.params
         await Pokemon.destroy({
             where: {
                id,
             }
         })
         res.status(200).send('Pokemon eliminado')
     } catch (error) {
         console.log(error)
     }
 }
)

router.put('/pokemons/:id', async (req, res) => {
    try { 
        const {id} = req.params
        let {name, hp, attack, defense, speed, height, weight, image, types} = req.body
       const pk = Pokemon.findByPk(id)
       if(pk) {
           const actualizado = Pokemon.update({name, hp, attack, defense, speed, height, weight, image, types}, {
               where : {
                   id    
               }
           })
       }
       res.status(200).send('pokemon actualizado')
    } catch (error){
        console.log(error)
    }
})


module.exports = router;