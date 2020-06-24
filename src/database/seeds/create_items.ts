import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('items').insert([
        { title: 'Crimes', image: 'circulo-vermelho.svg' },
        { title: 'Alertas', image: 'circulo-amarelo.svg' },
        { title: 'Socorros', image: 'circulo-verde.svg' },
        { title: 'Autoridades', image: 'circulo-azul.svg' },
    ]);
}