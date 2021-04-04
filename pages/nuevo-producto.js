import React, { useState, useContext } from 'react';
import styled from '@emotion/styled';
import Router, { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';

import Layout from '../components/layout/Layout';
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/Formulario';

import { FirebaseContext } from '../firebase';

import Error404 from '../components/layout/404';

// Validaciones
import useValidacion from '../hooks/useValidacion';
import validarCrearProducto from '../validacion/validarCrearProducto';


const NombrePagina = styled.h1`
  text-align: center;
  margin-top: 5rem;
`;

const STATE_INICIAL = {
  nombre: '',
  empresa: '',
  //imagen: '',
  url: '',
  descripcion: '',
}

export default function NuevoProducto() {

  // State de la imágenes
  const [ nombreimagen, guardarNombre ] = useState('');
  const [ subiendo, guardarSubiendo ] = useState(false);
  const [ progreso, guardarProgreso ] = useState(0);
  const [ urlimagen, guardarUrlImagen ] = useState('');

  const [ error, guardarError ] = useState(false);

  const {valores, errores, handleSubmit, handleChange, handleBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);

  const { nombre, empresa, imagen, url, descripcion } = valores;

  // Hook de Routing para redireccionar
  const router = useRouter();

  // Context con las operaciones CRUD de firebase
  const { usuario, firebase } = useContext(FirebaseContext);


  async function crearProducto() {
    
    // Si el usuario no está autenticado
    if(!usuario){
      return router.push('/login');
    }

    // Crear el objeto de nuevo producto
    const producto = {
      nombre,
      empresa,
      url,
      urlimagen,
      descripcion,
      votos: 0,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName,
      },
      haVotado: []
    }

    // Insertar en la Base de Datos
    firebase.db.collection('productos').add(producto);
    return router.push('/');
  }

  const handleUploadStart = () => {
    guardarProgreso(0);
    guardarSubiendo(true);
  };
   
 
  const handleProgress = async (progreso, task) => {
    console.log("progreso");
    guardarProgreso(progreso);
    if(progreso === 100){
      handleUploadSuccess(task.snapshot.ref.name);
    }
  };
 
  const handleUploadError = error => {
    guardarSubiendo(error);
    console.log(error);
  };
 
  const handleUploadSuccess = async nombre => {
    console.log(nombre, 'Este es el nombre');
    guardarProgreso(100);
    guardarSubiendo(false);
    guardarNombre(nombre);
    await firebase
      .storage
      .ref("productos")
      .child(nombre)
      .getDownloadURL()
      .then(url => {
        console.log(url);
        guardarUrlImagen(url);
      });
  };

  return (
    <div>
      <Layout>

        { !usuario ? <Error404/> : (
          <>
            <NombrePagina>Nuevo Producto</NombrePagina>
            <Formulario
              onSubmit={handleSubmit}
              noValidate
            >
              <fieldset>
                <legend>Información General</legend>
                <Campo>
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    placeholder="Nombre del Producto"
                    name="nombre"
                    value={nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.nombre && <Error>{errores.nombre}</Error>}

                <Campo>
                  <label htmlFor="empresa">Empresa</label>
                  <input
                    type="text"
                    id="empresa"
                    placeholder="Nombre Empresa"
                    name="empresa"
                    value={empresa}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.empresa && <Error>{errores.empresa}</Error>}

                <Campo>
                  <label htmlFor="imagen">Imagen</label>
                  <FileUploader
                    accept="image/*"
                    id="imagen"
                    name="imagen"
                    randomizeFilename
                    storageRef={firebase.storage.ref('productos')}
                    onUploadStart={handleUploadStart}
                    onUploadError={handleUploadError}
                    //onUploadSuccess={handleUploadSuccess}
                    onProgress={handleProgress}
                  />
                </Campo>

                <Campo>
                  <label htmlFor="url">URL</label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    placeholder="URL de tu producto"
                    value={url}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.url && <Error>{errores.url}</Error>}
                
              </fieldset>

              <fieldset>
                <legend>Sobre tu Producto</legend>

                <Campo>
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={descripcion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.descripcion && <Error>{errores.descripcion}</Error>}


              </fieldset>
                {error && <Error>{error}</Error>}

                <InputSubmit 
                  type="submit"
                  value="Crear Producto"
                />

              

            </Formulario>
          </>
          

        )}

        
      </Layout>
    </div>
  )
}
