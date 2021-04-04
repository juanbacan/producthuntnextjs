import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';

import Layout from '../../components/layout/Layout';
import { FirebaseContext } from '../../firebase';
import Error404 from '../../components/layout/404';
import styled from '@emotion/styled';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale';

import { Campo, InputSubmit } from '../../components/ui/Formulario'; 
import Boton from '../../components/ui/Boton'; 


const NombreProducto = styled.h1`
    text-align: center;
    margin-top: 5rem;
`;

const ContenedorProducto = styled.div`
    @media (min-width:768px) {
        display: grid;
        grid-template-columns: 2fr 1fr;
        column-gap: 2rem;
    }
`;

const Comentario = styled.div`
    margin: 2rem 0;
`;
const Votos = styled.p`
    text-align: center;
`;

const Votar = styled.div`
    margin-top: 5rem;
`;

const Comentarios = styled.li`
    border: 1px solid #e1e1e1;
    padding: 2rem;
`;
const SpanComentario = styled.span`
    font-weight: bold;
`;

const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: #DA552F;
    color: #FFF;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center;
`;


const Producto = () => {

    // State del componente
    const [ producto, guardarProducto ] = useState({});
    const [ error, guardarError ] = useState(false);
    const [ comentario, guardarComentario ] = useState({});
    const [ consultarDB, guardarCosultarDB ] = useState(true);

    // Routing para obtener el id actual
    const router = useRouter();
    const { query: { id }} = router;

    // Context de firebase
    const { firebase, usuario } = useContext(FirebaseContext); 

    useEffect(() => {
        //console.log('UseEffect');
        if(id && consultarDB) {
            console.log(id);
            
            const obtenerProducto = async () => {
                const productoQuery = await firebase.db.collection('productos').doc(id);
                const producto = await productoQuery.get();

                if(producto.exists) {
                    guardarProducto( producto.data() );
                    guardarCosultarDB(false);
                } else {
                    guardarError(true);
                    guardarCosultarDB(false);
                }
            };
            obtenerProducto();

        }
    }, [id]);

    if(Object.keys(producto).length === 0 && !error) return 'Cargando...';

    const { id1, comentarios, creado, descripcion, empresa, nombre, url, urlimagen, votos, creador, haVotado } = producto;



    // Administrar y validar los votos
    const votarProducto = () => {
        if(!usuario){
            return router.push('/login');
        }

        // Verificar si el usuario actual ha votado
        if(haVotado.includes(usuario.uid)) return;

        // Obtener y sumar un nuevo voto
        const nuevoTotal = votos + 1;

        // Guardar el ID del usuario que ha votado
        const nuevoHaVotado = [...haVotado, usuario.uid];

        // Actualizar en la Base de Datos
        firebase.db.collection('productos').doc(id).update({ 
            votos: nuevoTotal, 
            haVotado: nuevoHaVotado 
        });



        // Actualizar el state
        guardarProducto({
            ...producto,
            votos: nuevoTotal,
            haVotado: nuevoHaVotado
        });

        // Se registra un voto, se consulta a la BD
        guardarCosultarDB(true);     
    }

    // Funciones para crear comentarios
    const comentarioChange = e => {
        guardarComentario({
            ...comentario,
            [e.target.name] : e.target.value,
        })
    }

    // Identifica si el comentario es el creador del producto
    const esCreador = id => {
        if(creador.id === id){
            return true;
        }
    }

    const agregarComentario = e => {
        e.preventDefault();
        if(!usuario){
            return router.push('/login');
        }

        // Información extra al comentario
        comentario.usuarioId = usuario.uid;
        comentario.usuarioNombre = usuario.displayName;

        // Tomar copia de comentarios y agregarlos al arreglo
        const nuevosComentarios = [...comentarios, comentario];

        // Actualzar la BD
        firebase.db.collection('productos').doc(id).update({
            comentarios: nuevosComentarios
        })

        // Actualizar el state
        guardarProducto({
            ...producto,
            comentarios: nuevosComentarios 
        })

        // Se ha registrado un comentario, consulta la BD
        guardarCosultarDB(true);
    }

    // Funcion que revisa que el creador del producto sea el mismo que esta autenticado
    const puedeBorrar = () => {
        if(!usuario) return false;
        if(creador.id === usuario.uid){
            return true;
        }
    }

    // Elimina un Producto de la Base de Datos
    const eliminarProducto = async () => {
        if(!usuario){
            return router.push('/login');
        }
        if(creador.id !== usuario.uid){
            return router.push('/login');
        }
        try {
            
            await firebase.db.collection('productos').doc(id).delete();
            router.push('/');
        } catch (error) {x
            console.log(error);
        }
    }

    return (
        <Layout>
            <>
                { error ? <Error404/> :
                    (
                        <div className="contenedor">
                            <NombreProducto>{ nombre }</NombreProducto>
                            <ContenedorProducto>
                                <div>
                                    <p>Publicado hace: {formatDistanceToNow(new Date(creado), {locale: es})}</p>
                                    <p> Por: {creador.nombre} de: {empresa}</p>
                                    <img src={urlimagen} />
                                    <p>{descripcion}</p>
                                    <h2>Agrega tu comentario</h2>
                                    
                                    { usuario && (
                                        <>
                                            <form
                                                onSubmit={agregarComentario}
                                            >
                                                <Campo>
                                                <input 
                                                    type="text"
                                                    name="mensaje"
                                                    onChange={comentarioChange}
                                                />
                                                </Campo>
                                                    <InputSubmit
                                                    type="submit"
                                                    value="Agregar Comentario"
                                                />
                                            </form>
                                        </>
                                    )}

                                    <Comentario>Comentarios</Comentario>

                                    {comentarios.length === 0 ? "Aún no hay comentarios" : (
                                        <ul>
                                            {comentarios.map((comentario, i) => (
                                                <Comentarios
                                                    key={`${comentario.usuarioId}-${i}`}
                                                >
                                                    <p>{comentario.mensaje}</p>
                                                    <p>Escrito por: &nbsp;  
                                                        <SpanComentario>{comentario.usuarioNombre}</SpanComentario>
                                                    </p>
                                                    { esCreador( comentario.usuarioId ) && <CreadorProducto>Es Creador</CreadorProducto>}
                                                </Comentarios>
                                            ))}
                                        </ul>

                                    )}                    
                                </div>
                                <aside>
                                    <Boton
                                        target="_blank"
                                        bgColor="true"
                                        href={url}
                                    >
                                        Visitar URL
                                    </Boton>

                                    <Votar>
                                        <Votos>{votos} Votos</Votos>
                                        
                                        { usuario && (
                                            <Boton
                                                onClick={votarProducto}
                                            >
                                                Votar
                                            </Boton>
                                        )}

                                    </Votar>
                                </aside>
                            </ContenedorProducto>
                            { puedeBorrar() && 
                                <Boton
                                    onClick={eliminarProducto}
                                >
                                    Eliminar Producto
                                </Boton>
                            }
                        </div>
                    )
                }
            </>
        </Layout>
    );
}
 
export default Producto;