import { escaparHtml } from './html';

describe('escaparHtml', () => {
  it('should escape the characters that HTML interprets', () => {
    expect(escaparHtml('Laptop <HP> 15 & "i7"')).toBe('Laptop &lt;HP&gt; 15 &amp; &quot;i7&quot;');
  });

  it('should escape single quotes', () => {
    expect(escaparHtml("O'Neil")).toBe('O&#39;Neil');
  });

  it('should neutralize an injected tag', () => {
    const resultado = escaparHtml('<img src=x onerror=alert(1)>');
    expect(resultado).not.toContain('<');
    expect(resultado).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('should not escape an already escaped ampersand twice by mistake in normal text', () => {
    expect(escaparHtml('Ventas & Compras')).toBe('Ventas &amp; Compras');
  });

  it('should return empty text for null and undefined', () => {
    expect(escaparHtml(null)).toBe('');
    expect(escaparHtml(undefined)).toBe('');
  });

  it('should convert numbers to text', () => {
    expect(escaparHtml(1500)).toBe('1500');
  });

  it('should leave normal text unchanged', () => {
    expect(escaparHtml('HPX360I3X-30 Latitude 3410')).toBe('HPX360I3X-30 Latitude 3410');
  });
});
