[![codecov](https://codecov.io/gh/Taller-de-programacion-2-Grupo-14/user-auth/branch/master/graph/badge.svg?token=A30ZSLX1NV)](https://codecov.io/gh/Taller-de-programacion-2-Grupo-14/user-auth)
![Test status](https://github.com/Taller-de-programacion-2-Grupo-14/user-auth/actions/workflows/master.yml/badge.svg)
![linter](https://github.com/Taller-de-programacion-2-Grupo-14/user-auth/actions/workflows/code-quality-workflow.yml/badge.svg)
[![Build Status](https://app.travis-ci.com/Taller-de-programacion-2-Grupo-14/user-auth.svg?branch=master)](https://app.travis-ci.com/Taller-de-programacion-2-Grupo-14/user-auth)
# user-auth
Repositorio encargado de contener todos los procesos asociados a registro y login del usuario.
Ademas de contener toda la informacion de los usuarios.
## Instalacion:
La instalacion se hace con npm i --force
El force es necesario ya que se tienen algunas dependencias que conflictuan con otras en papel, pero el unico motivo de importarse es que lo requieren paquetes que si son necesarios. 
En algunos sistemas el --force no es necesario ya que en esos sistemas no hay conflicto.
## Tests
Los tests se corren en codecov, y en travis por lo que de tener acceso se pueden ver los resultados alli, pero tambien se puede ejecutar de manera local haciendo npm test.
## Correr de manera local.
Para ejecutar de manera local se debe correr una base de datos local, ya sea con docker, o con alguna base de datos online de su preferencia. Para asociarla al codigo se debe usar la variable de entorno DATABASE_URL y guardar ahi la url de la database.
Luego se puede correr con docker la imagen y levantarla con los comandos que provee docker. La otra posibilidad es usando npm run start.
## Correr con makefile.
Se puede ejecutar el comando de make buildDC para compilar el codigo y luego correr runDC para ejecutar la base de datos y el codigo en conjunto en un ambiente local.
## Variables de entorno necesarias para un uso completo:
### COURSES_API: URL de donde se va a interactuar con la api de cursos
### DATABASE_URL: URL de donde se va a conectar a la database.
### email: email el cual la aplicacion va a enviar mails para recuperar contraseña
### pswd: password de dicho mail
### PAYMENTS_API: URL de donde se va a interactuar con la api de payments
### secret: secreto de la aplicacion
### algorithm: algoritmo de hasheo
