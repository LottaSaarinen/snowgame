
import { useState, useEffect } from 'react';
import AppRouter from './components/AppRouter';
import items from './config/items.js';
import getPurchasableItems from './utils/getPurchasableItems';
import round from './utils/round';
import './App.css';
import useLocalStorage from './utils/useLocalStorage';
import MusicPlayer from './components/MusicPlayer'; // Lisää tämä

const fruits = ['lemon', 'banana', 'apple', 'orange', 'grape', 'pineapple', 'strawberry'];

function App() {
  const initialstats = {
    clicks: 0,
    balance: 0,
    increase: 1,
    itemstobuy: 0,
    upgrades: 0,
    collected: 0,
    fruit: 'lemon',
    lemonPoints: 0,
    bananaPoints: 0
  };

  const [stats, setStats, resetStats] = useLocalStorage('lemon-stats', initialstats);
  const [storeitems, setStoreitems, resetStoreitems] = useLocalStorage('lemon-items', items);

 
  const weightedRandomFruit = () => {
    const weightedFruits = [
      'lemon', 'lemon', 'lemon', 'lemon', 'lemon','lemon', 
      'banana', 'banana', 'banana', 'banana','banana',
      'apple', 'orange', 'grape', 'pineapple', 'strawberry'
    ];
    const randomIndex = Math.floor(Math.random() * weightedFruits.length);
    return weightedFruits[randomIndex];
  };

  useEffect(() => {
    
    const changeFruit = () => {
      const randomFruit = weightedRandomFruit(); 
      
      setStats(prevStats => {
        if (prevStats.fruit !== randomFruit) {
          return { ...prevStats, fruit: randomFruit };
        }
        return prevStats; 
      });
    };
    const setFruitChangeTimer = () => {
      const randomInterval = Math.random() * (300000 - 120000) + 120000; 
      setTimeout(() => {
        changeFruit();
        setFruitChangeTimer(); 
      }, randomInterval);
    };

    // Käynnistämme hedelmän vaihdon heti
    changeFruit();
    setFruitChangeTimer();
  }, []); 

  // Laskee niiden tuotteiden lukumäärän, joiden ostamiseen on varaa.
  const countBuyableItems = (items, balance) => {
    let total = 0;
    getPurchasableItems(items).forEach(item => {
      if (item.price <= balance) total++;
    });
    return total;
  };

  const handleClick = () => {
    // Tehdään kopio stats-tilamuuttujasta.
    let newstats = {...stats}
    // Kasvatetaan napautusten lukumäärää yhdellä.
    newstats.clicks = newstats.clicks + 1;
    // Kasvataan sitruunoiden määrää kasvatusarvolla.
    newstats.balance = round(newstats.balance + newstats.increase, 1);
    // Kasvataan sitruunoiden keräysmäärää.
    newstats.collected = round(newstats.collected + newstats.increase, 1);
    // Lasketaan ostettavissa olevien tuotteiden lukumäärä.
    newstats.itemstobuy = countBuyableItems(storeitems, newstats.balance);
    // Tallennetaan päivitetty stats-muuttuja.
    setStats(newstats);
  };

  const handlePurchase = (id) => {
    // Etsitään tunnistetta vastaavan tuotteen indeksi taulukosta.
    const index = storeitems.findIndex(storeitem => storeitem.id == id);
    // Varmistetaan, että käyttäjällä on varaa ostaa tuote.
    if (stats.balance >= storeitems[index].price) {
      // Tehdään kopiot tilamuuttujista.
      let newstoreitems = [...storeitems];
      let newstats = {...stats};
      // Kasvatetaan tuotteiden määrää yhdellä.
      newstoreitems[index].qty++;
      // Vähännetään varoista tuotteen hinta.
      newstats.balance = round(newstats.balance - newstoreitems[index].price, 1);
      // Lasketaan tuotteen uusi hinta.
      newstoreitems[index].price =
        Math.floor(newstoreitems[index].baseprice * Math.pow(1.15, newstoreitems[index].qty));
      // Koostemuuttujien esittely.
      let increase = 1;
      let upgrades = 0;
      // Käydään tuotteet yksitellen lävitse.
      for (let i = 0; i < storeitems.length; i++) {
        // Lisätään tuotteiden määrä kokonaismäärään.
        upgrades = upgrades + storeitems[i].qty;
        // Lisätään tuotteen vaikutus kasvatusarvoon.
        increase = increase + storeitems[i].multiplier * storeitems[i].qty;
      }
      // Tallennetaan lasketut koostearvot.
      newstats.increase = increase;
      newstats.upgrades = upgrades;
      // Lasketaan ostettavissa olevien tuotteiden lukumäärä.
      newstats.itemstobuy = countBuyableItems(newstoreitems, newstats.balance);
      // Tallennetaan uudet tilamuuttujien arvot.
      setStoreitems(newstoreitems);
      setStats(newstats);
    }
  };

  const handleReset = () => {
    // Päivitetään tilamuuttujat alkuarvoihin.
    setStats(initialstats);
    console.log(items);
    setStoreitems(items);
  };

  return (
    <div className="App">
      <MusicPlayer src="/src/music/song.mp3" /> {/* Lisää tämä */}
      <AppRouter
        stats={stats}
        storeitems={storeitems}
        handleClick={handleClick}
        handlePurchase={handlePurchase}
        handleReset={handleReset}
      />
    </div>
  );
}

export default App;

