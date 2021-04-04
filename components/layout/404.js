import React from 'react';
import styled from '@emotion/styled';

const NoProducto = styled.h1`
    margin-top: 5rem;
    text-align: center;
`;

const Error404 = () => {
    return (
        <>
            <NoProducto>No se puede mostrar</NoProducto>
        </>
    );
}
 
export default Error404;