
export class TokenPayload{
    public id: string;
    public role:string;

    constructor(users : any){
        this.id = users._id.toString();
        this.role = users.role;
    }
}