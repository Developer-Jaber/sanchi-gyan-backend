export function verificationEmailTemplate(link: string): string {
  return `<p>Verify your email by clicking <a href="${link}">here</a>. This link expires in 24 hours.</p>`;
}

export function resetPasswordEmailTemplate(link: string): string {
  return `<p>Reset your password by clicking <a href="${link}">here</a>. This link expires in 1 hour.</p>`;
}
