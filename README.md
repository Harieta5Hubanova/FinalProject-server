# Final Project Server

## Routes

### Crag Routes

| Method | Route          | Description                |
| ------ | -------------- | -------------------------- |
| GET    | /api/crags     | Returns all crags          |
| GET    | /api/crags/:id | Returns the specified crag |
| POST   | /api/crags     | Creates a new crag         |
| PUT    | /api/crags/:id | Edits the specified crag   |
| DELETE | /api/crags/:id | Deletes the specified grag |

### Auth Routes

| Method | Route        | Description        |
| ------ | ------------ | ------------------ |
| POST   | /auth/signup | Creates a new user |
| POST   | /auth/login  | Logs the user      |
| GET    | /auth/verify | Verifies the JWT   |

### User Model

```js
{
    name: String,
    email: String,
    password: String,
    imageUrl: String,
    gender:String,
    country : String,
    city: String,
    dob : Date,
    level: Number

}
```

## Crag Model

```js
{
    cragName: String,
    coordinates:{latitute:String, longitude:String},
    country: String,
    level: Number,
    imageUrl:String,
    description:String,
    climbers:[{type:Schema.Types.ObjectId, ref: "User"}],
    comment:[{type: Schema.Types.ObjectId, ref: "Comment"}]
}
```

## Comment Model

```js
{
    cragName: String,
    level : Number,
    textarea: String

}
```
