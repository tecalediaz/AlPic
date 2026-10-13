# AlPic

AlPic es un proyecto personal de [tecalediaz](https://tecalediaz.com). Permite diseñar una plantilla para redes sociales, aplicarla a distintas fotos y descargar el resultado en PNG. La [demo](https://alpicxd.netlify.app) incluye el flujo completo.

## Probarlo

1. Abrí la demo en una computadora con una ventana de al menos **800 px** de ancho.
2. Elegí **Probar AlPic** y creá un estilo.
3. Diseñá la plantilla en el editor y guardala.
4. Seleccioná el estilo, cargá una foto y descargá la imagen final.

Los estilos se guardan en `localStorage` del navegador. No hay cuentas, base de datos ni servidor que almacene fotos o plantillas. Los estilos quedan en ese navegador y se pierden si se borran sus datos. Las fotos cargadas para aplicar un estilo se procesan en el navegador.

## Ejecutar localmente

Requiere Node.js 20 o superior.

```bash
npm ci
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). No hacen falta variables de entorno.

## Verificar

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Tecnologías

Next.js 16, React 19, TypeScript, Fabric.js y Tailwind CSS. El sitio está configurado para publicarse en Netlify mediante `netlify.toml`.

## Licencia

Este repositorio contiene el código del proyecto. Consultá [LICENSE](LICENSE) para los términos de uso.
