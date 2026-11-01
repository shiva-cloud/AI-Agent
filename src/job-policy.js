export class JobPolicyDenied extends Error {
  constructor(message = 'Job policy denied') {
    super(message);
    this.name = 'JobPolicyDenied';
  }
}
