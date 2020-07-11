// import Knex from "knex";

exports.up = function(knex) {
    return knex.schema.createTable('points', table => {

        table.increments('id').notNullable();
        table.string('image').notNullable();
        table.string('hora');
        table.string('crime');
        table.string('descricao').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude').notNullable();
        table.string('city').notNullable();
        table.string('uf', 2).notNullable();
    });
}

exports.down = function(knex) {
    return knex.schema.dropTable('points');
}