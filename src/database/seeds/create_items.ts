import Knex from 'knex';

export async function seed(knex: Knex) {
    const [itemsCount] = await knex('items').count({ count: '*' });

    if (Number(itemsCount.count) > 0) {
        return;
    }

    await knex('items').insert([
        { title: 'Crimes', image: 'circulo-vermelho.svg' },
        { title: 'Alertas', image: 'circulo-amarelo.svg' },
        { title: 'Socorros', image: 'circulo-verde.svg' },
        { title: 'Autoridades', image: 'circulo-azul.svg' },
    ]);
}
