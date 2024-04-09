export interface IRole {
    id?: string;
    name?: string;
    description?: string;
    totalCount?: number;
}

export class Role implements IRole {
    id?: string;
    name?: string;
    description?: string;
    totalCount?: number;

    constructor(
        id?: string,
        name?: string, 
        description?: string,
        totalCount?: number
    ) 
    {
        this.id = id;
        this.name = name;
        this.description = description;
        this.totalCount = totalCount;
    }
}