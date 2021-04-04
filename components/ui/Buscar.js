import React, {useState} from 'react';
import styled from '@emotion/styled';
import Router from 'next/router';

const InputText = styled.input`
    border :1px solid var(--gris3);
    padding: 1rem;
    min-width: 300px;
`; 

const InputSubmit = styled.button`
    height: 30px;
    width: 3rem;
    display: block;
    background-size: 4rem;
    background-image: url('/static/img/buscar.png');
    background-repeat: no-repeat;
    position: absolute;
    right: 1rem;
    top: 1px;
    background-color: white;
    border: none;
    text-indent: -9999px;

    &:hover {
        cursor: pointer;
    }
`;

const Formulario = styled.form`
    position: relative;
`;

const Buscar = () => {

    const [ busqueda, guardarBusqueda ] = useState('');

    const buscarProducto = e => {
        e.preventDefault();

        if(busqueda.trim() === '') return;

        // Redireccionar al usuario /buscar
        Router.push({
            pathname: '/buscar',
            query: { q : busqueda}
        });

    }

    return (
        <Formulario
            onSubmit={buscarProducto}
        >
            <InputText 
                type="text"
                placeholder="BuscarProductos"
                onChange={e => guardarBusqueda(e.target.value)}
            />
            <InputSubmit type="submit">Buscar</InputSubmit>
        </Formulario>
    );
}
 
export default Buscar;