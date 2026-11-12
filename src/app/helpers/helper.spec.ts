import { cambioDeSesion } from './helper';

/** Arma un JWT sin firma solo con las reclamaciones que lee el helper. */
function token(claims: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'none' })}.${b64(claims)}.firma`;
}

describe('cambioDeSesion', () => {
  const espejo = token({ name: 'mkfacturacione', IdEmpresa: '36', exp: 1 });
  const principal = token({ name: 'ssantiago', IdEmpresa: '31', exp: 1 });

  it('detecta otro usuario o empresa', () => {
    expect(cambioDeSesion(espejo, principal)).toBeTrue();
  });

  it('no cuenta la renovación del token del mismo usuario', () => {
    expect(cambioDeSesion(espejo, token({ name: 'mkfacturacione', IdEmpresa: '36', exp: 999 }))).toBeFalse();
  });

  it('detecta el cambio de empresa con el mismo usuario', () => {
    expect(cambioDeSesion(espejo, token({ name: 'mkfacturacione', IdEmpresa: '31' }))).toBeTrue();
  });

  it('detecta el cierre de sesión y el primer inicio', () => {
    expect(cambioDeSesion(espejo, null)).toBeTrue();
    expect(cambioDeSesion(null, espejo)).toBeTrue();
  });

  it('un token ilegible equivale a sin sesión', () => {
    expect(cambioDeSesion('basura', null)).toBeFalse();
  });
});
