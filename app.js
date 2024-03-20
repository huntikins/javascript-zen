document.addEventListener("alpine:init", () => {
  Alpine.data("pokemon", () => ({
    pokemon: [],
    availableCards: [],
    savedCards: [],
    active: {},
    cardCount: 1,
    isLoaded: false,

    init() {
      this.getAllPokemon();
    },

    async getAllPokemon() {
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokedex/national"
        );

        if (response.ok) {
          const data = await response.json();
          this.pokemon = data.pokemon_entries;

          await this.getRandomPokemon();
        } else {
          console.error("Could not retrieve list of pokemons", response);
        }
      } catch (error) {
        console.error(error);
        return;
      }
    },

    async getRandomPokemon() {
      this.isLoaded = false;
      this.active = {
        name: "back of Pokemon card",
        image: "/pokeback.webp",
      };
      this.availableCards = [];
      const quedPokemon =
        this.pokemon[Math.floor(Math.random() * this.pokemon.length)];

      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${quedPokemon.entry_number}`
        );

        if (response.ok) {
          await this.getPokemonMeta(await response.json());
        } else {
          console.error("Could not retrieve individual pokemon", response);
        }
      } catch (error) {
        console.error(error);
        return;
      }
    },

    async getPokemonMeta(pokemon) {
      try {
        const response = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=name:${pokemon.name}`
        );

        if (response.ok) {
          const cards = await response.json();
          this.availableCards = cards.data;

          if (this.availableCards.length >= this.cardCount) {
            this.active = {
              name: pokemon.name,
              image: this.availableCards[this.cardCount - 1].images.large,
            };
            this.cardCount++;
            this.isLoaded = true;
          } else {
            this.availableCards = [];
          }
        } else {
          console.error("Could not retrieve TCG cards", response);
        }
      } catch (error) {
        console.error(error);
        return;
      }
    },

    getNextPokemonCard() {
      this.isLoaded = false;
      this.cardCount++;

      const card = this.availableCards[this.cardCount - 1];

      if (!card) {
        return;
      }

      this.active = {
        name: card.name,
        image: card.images.large,
      };

      this.isLoaded = true;
    },

    savePokemonCard() {
      this.savedCards.push(this.active);

      if (this.availableCards.length > this.cardCount) {
        this.getNextPokemonCard();
      } else {
        this.getRandomPokemon();
      }
    },
  }));
});
