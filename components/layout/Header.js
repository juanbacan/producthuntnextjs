import React, { useContext } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';

import Buscar from '../ui/Buscar';
import Navegacion from './Navegacion';
import Boton from '../ui/Boton';
import { FirebaseContext } from '../../firebase';


const ContenedorHeader = styled.div`
    max-width: 1200px;
    width: 95%;
    margin: 0 auto;
    @media (min-width: 768px){
        display: flex;
        justify-content: space-between;
    }
`;

const Logo = styled.p`
    color: var(--naranja);
    font-size: 4rem;
    line-height: 0;
    font-weight: 700;
    font-family: 'Roboto Slab', serif;
    margin-right: 2rem;
`;

const Sesion = styled.div`
    display: flex;
    align-items: center;
`;

const Cabecera = styled.header`
    border-bottom: 2px solid var(--gris3);
    padding: .2rem 0;
`;

const HolaNombre = styled.p`
    margin-right: 2rem;
`;

const CabeceraIzquierda = styled.div`
    display: flex;
    align-items: center;
`;

const Header = () => {

    const { usuario, firebase } = useContext(FirebaseContext);

    return (
        <Cabecera>      
            <ContenedorHeader>
                <CabeceraIzquierda>
                    <Link href="/">
                        <Logo>P</Logo>
                    </Link>
                    
                    <Buscar />
                    <Navegacion/>
                </CabeceraIzquierda>

                <Sesion>                
                    { usuario ? (
                        <>
                            <HolaNombre>Hola: {usuario.displayName}</HolaNombre>
                            <Boton
                                bgColor="true"
                                onClick={() => firebase.cerrarSesion()}
                            >
                                Cerrar sesión
                            </Boton>
                        </>
                    ):(
                        <>
                        <Link href="/login">
                            <Boton
                                bgColor="true"
                            >Login</Boton>
                        </Link>
                        <Link href="/crear-cuenta">
                            <Boton>Crear Cuenta</Boton>
                        </Link>
                        </>
                    )}
                </Sesion>
            </ContenedorHeader>
        </Cabecera>
    );
}
 
export default Header;