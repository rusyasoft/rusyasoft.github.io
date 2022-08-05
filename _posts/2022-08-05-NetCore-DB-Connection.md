---
title: .Net Core Database Connection Steps
categories:
 - DOTNET
tags:
 - Net, Net-Core, Database, DB, DB-Connection
---

This post describes steps needed to setup connection with .Net Core MVC application and database. May be some of the parts of this code can be used by non-MVC based projects as well (can't guarantee it because haven't tried myself). This post has been snippeted from the O'reilly course called [The Complete Guide to ASP.NET Core MVC (.NET 6)](https://learning.oreilly.com/videos/the-complete-guide/9781801074247/).

Here are the rough steps (can be done not particularly in this order):
1. Add Model
2. Add connection string to appsettings.json
3. Add ApplicationDbContext class that handles/forwards options of the connection string to DbContext
4. AddDbContext to Program.cs (Where actual code based initialization is happening)

## Add Model

Under Models folder we create a class which we would like to use in our project. It eventually going to turn into a table in our database.

```C#
using System.ComponentModel.DataAnnotations;

namespace BulkyBookWeb.Models;

public class Category
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedDateTime { get; set; } = DateTime.Now;
}
```

`Id` becomes a primary key in our Categories table, since we annotated it with `Key`. `Name` becomes required column (or non-null column).

## Add Connection String

Connection string is something that can be declared in many ways, but most best practice is to declare it in a `appsettings.json` file. That way we can also distinguish which connection string would be used in a what environment (prod, dev, local etc). 

```
{
    "ConnectionStrings": {
        "DefaultConnection": "Server=<localdb-Or-Address-Of-DB-goes-here>;Database=<Database-Name-Intended-to-Connect>;Trusted_Connection=True;"
    }
}
```

`Trusted_Connection` option is telling to application to use Windows Authentication. I don't think it would be proper to use it in production servers.

## Creating a Database

In order to store our table, first we need to have our database to be exist. We can go database first model, when we create a database before hand and just use the connection. Another way is called code-first way, where database is created by the code if it doesn't exist. To interact with database we need db-context, and it is represented as DbContext class. We can create a new ApplicationDbContext class that inherits from DbContext and used to represent our Database. 

Note: Microsoft.EntityFrameworkCore package should be installed (by NuGet) before-hand otherwise DbContext class will not be recognized.

```C#
using Microsoft.EntityFrameworkCore;
using BulkyBookWeb.Models;

namespace BulkyBookWeb.Data;

public class ApplicationDbContext : DbContext 
{
     public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) 
     {
     }

     public DbSet<Category> Categories { get; set; }
}
```

It will create a `Categories` table with columns as its defined by Category model.


## Adding DbContext to Program.cs

Following line goes somewhere under `var builder = WebApplication.CreateBuilder(args)` but before we actually call `Build()` on builder object.

Note: Microsoft.EntityFrameworkCore.SqlServer package should be installed (by NuGet) before-hand, otherwise `UseSqlServer()` will not be recognized. 

```
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("DefaultConnection")
));
```

`DefaultConnection` is the name that has been chosen at connection string inside `appsettings.json` file.


## Migration

In order to actually deploy the database changes, or even creation of new table and columns at the beginning we have to perform migration. I know the wording might be confusing since we are not migrating anything, but that term has been chosen. In order to perform migration we of databases we have to install another NuGet package called `Microsoft.EntityFrameworkCore.Tools`. 

After that we can go to NuGet package manager console (Tools -> NuGet Package Manager -> Package Manager Console)  and run add-migration command.

```
PM> add-migration AddCategoryToDatabase
```

`AddCategoryToDatabase` is just a name of our migration, we can name it whatever we want, but making sensible names would help you in the future. When everything run successfully you get success message.

```
PM> add-migration AddCategoryToDatabase
Build started...
Build succeeded.
To undo this action, use Remove-Migration.
```

As a result of this run, under your project you will have a new Migrations folder created. `AddCategoryToDatabase` class has two methods `Up` (to actually perform changes) and `Down` (to rollback changes). Now to perform migrations we should run `update-database` command on NuGet package manager console.

