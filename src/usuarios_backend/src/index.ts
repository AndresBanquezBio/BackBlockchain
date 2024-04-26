import {
    Canister,
    Err,
    Ok,
    Opt,
    Principal,
    query,
    Record,
    Result,
    StableBTreeMap,
    text,
    update,
    Variant,
    Vec
} from 'azle';

const User = Record({
    id: Principal,
    nombre: text,
    primerApellido: text,
    segundoApellido: text,
    alias: text
});
type User = typeof User.tsType;

const AplicationError = Variant({
    UserDoesNotExist: Principal
});

type AplicationError = typeof AplicationError.tsType;

let users = StableBTreeMap<Principal, User>(0);

export default Canister({
    createUser: update([text, text, text, text], User, (nombre, primerApellido, segundoApellido, alias) => {
        const id = generateId();
        const user: User = {
            id:id,
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            alias: alias
        };

        users.insert(user.id, user);

        return user;
    }),
    readUsers: query([], Vec(User), () => {
        return users.values();
    }),
    readUserById: query([Principal], Opt(User), (id) => {
        return users.get(id);
    }),
    deleteUser: update([Principal], Result(User, AplicationError), (id) => {
        const userOpt = users.get(id);

        if ('None' in userOpt) {
            return Err({
                UserDoesNotExist: id
            });
        }

        const user = userOpt.Some;
        users.remove(user.id);
        return Ok(user);
    }),
    updateUser: update(
        [Principal, text, text, text, text],
        Result(User, AplicationError),
        (userId, nombre, primerApellido, segundoApellido, alias) => {
            const userOpt = users.get(userId);

            if ('None' in userOpt) {
                return Err({
                    UserDoesNotExist: userId
                });
            }
            const newUser: User = {
                id:userId,
                nombre: nombre,
                primerApellido: primerApellido,
                segundoApellido: segundoApellido,
                alias: alias
            };

            users.remove(userId)
            users.insert(userId, newUser);

            return Ok(newUser);
        }
    )
})

function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}