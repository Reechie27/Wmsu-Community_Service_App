import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    const fetchInitialPokemon = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await
          axios.get('https://pokeapi.co/api/v2/pokemon?limit=12');

        const detailedList = await Promise.all(
          response.data.results.map(async (item) => {
            const res = await axios.get(item.url);
            return res.data;
          })
        );

        setPokemonList(detailedList);
      } catch (err) {
        setError('Failed to load, try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPokemon();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    const query = searchTerm.trim().toLowerCase();

    if (!query) return;

    setLoading(true);
    setError('');

    try {
      const response = await
        axios.get(`https://pokeapi.co/api/v2/pokemon/${query}`);

      setPokemonList([response.data]);
    } catch (err) {
      setError('Pokémon not found!');
      setPokemonList([]);
    } finally {
      setLoading(false);
    }
  };

  const getHp = (stats) => {
    const hpStat = stats.find((s) => s.stat.name === 'hp');
    return hpStat ? hpStat.base_stat : 0;
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Pokédex</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search Pokémon Name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {loading && <div className="status-msg">Plss wait po...</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && (
        <div className="pokemon-grid">
          {pokemonList.map((pokemon) => {
            const primaryType =
              pokemon.types[0]?.type.name || 'normal';

            const hp = getHp(pokemon.stats);
            const moves = pokemon.moves.slice(0, 2);

            return (
              <div
                key={pokemon.id}
                className={`card card-type-${primaryType}`}
                onClick={() => setSelectedPokemon(pokemon)}
              >
                <div className="card-header">
                  <span className="card-stage">BASIC</span>
                  <span className="card-name">{pokemon.name}</span>
                  <span className="card-hp">HP {hp}</span>
                </div>

                <div className="card-image-box">
                  <img
                    src={
                      pokemon.sprites.other?.['official-artwork']?.front_default ||
                      pokemon.sprites.front_default
                    }
                    alt={pokemon.name}
                    className="card-image"
                  />
                </div>

                <div className="card-moves">
                  <div className="move-row">
                    <span className="move-label">Primary</span>
                    <span className="move-name">
                      {moves[0]?.move.name}
                    </span>
                  </div>

                  <div className="move-row">
                    <span className="move-label">Secondary</span>
                    <span className="move-name">
                      {moves[1]?.move.name}
                    </span>
                  </div>
                </div>

                <div className="card-footer">
                  <span>Weakness </span>
                  <span>Resistance </span>
                  <span>Retreat </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPokemon && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedPokemon(null)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setSelectedPokemon(null)}
            >
              ✕
            </button>

            {/* Pokémon Image inside Modal */}
            <div className="modal-image-box">
              <img
                src={
                  selectedPokemon.sprites.other?.['official-artwork']?.front_default ||
                  selectedPokemon.sprites.front_default
                }
                alt={selectedPokemon.name}
                className="modal-image"
              />
            </div>

            <h2 className="modal-title">
              {selectedPokemon.name}
            </h2>

            <div className="modal-id">
              #{selectedPokemon.id.toString().padStart(3, '0')}
            </div>

            <div className="modal-info">
              <div>
                <strong>Base XP:</strong>{' '}
                {selectedPokemon.base_experience}
              </div>

              <div>
                <strong>Abilities:</strong>{' '}
                {selectedPokemon.abilities
                  .map((a) => a.ability.name)
                  .join(', ')}
              </div>
            </div>

            <h3>Base Stats</h3>

            <div className="stats-list">
              {selectedPokemon.stats.map((statItem) => (
                <div
                  key={statItem.stat.name}
                  className="stat-row"
                >
                  <span className="stat-name">
                    {statItem.stat.name}
                  </span>

                  <span className="stat-value">
                    {statItem.base_stat}
                  </span>

                  <div className="stat-bar-bg">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: `${Math.min(
                          statItem.base_stat / 1.5,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
