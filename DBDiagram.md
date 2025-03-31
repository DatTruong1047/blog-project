    erDiagram
    USER {
        string id
        string firstname
        string lastname
        string email
        string password
        date dateOfBirth
        enum sex
        string address
        boolean isAdmin
        boolean isVerifiedEmail
        string mediaId
        date createdAt
        date updatedAt
    }

    MEDIA {
        string id
        string url
        string description
        date createdAt
        date updatedAt
    }

    TOKEN {
        int id
        string refresh_token
        date refresh_token_expiry
        string user_id
    }

    POST {
        string id
        string title
        enum status
        string content
        string authorId
        string categoryId
        date createdAt
        date updatedAt
    }

    CATEGORY {
        string id
        string name
        string slug
    }

    COMMENT {
        string id
        string content
        string postId
        string userId
        boolean isActive
        date createdAt
        date updatedAt
    }

    POSTMEDIA {
        string id
        string postId
        string mediaId
        date createdAt
        date updatedAt
    }

    USER ||--o{ POST : "writes"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ TOKEN : "has"
    USER ||--|| MEDIA : "has"
    POST ||--o{ COMMENT : "has"
    POST ||--o{ POSTMEDIA : "has"
    POST ||--|{ CATEGORY : "belongs to"
    POSTMEDIA ||--|| MEDIA : "references"


# Link: https://mermaid.live/edit#pako:eNqtVW2PmkAQ_itkP6sRVFC-2TvSmMazOa9N2piYPXaATWGX7C49rfrfu4ielMXGxvIB2JlnZp55gx0KOQHkI0tfIB4pjgXOVqw8flkGz9auei8vqQRlsUWJIYqokIrhDAxNiq8oIMM0NaQ5lvKNi1oEghUcb4voAxUquWiAFZklYWM4wYQIkPIif-U8BcwsKqcko6xN8RUEjSiQoJVWBoTiWZNVKEA_yFQ15EVO6vLD6hRxHjzOprcVtBAmCQIyFDRXlLM7ibwsPgVPdSKUqTYWAiJdyGSt-A9oxvxDt4ZNTsXWTEOCWJ8dv4f_vFi-3FYGRVUKzY4rrAppQEPOFDBlDkOhEi5mpu9QZxFzsb27rQ_Tl-Dj4vnbbSm1LoNMi7jpdTGfB0831ula8jmXqiX1si11cW0_QkV_wp0FKfv7D7N-heT_2bnjN2y_73b5rpo731qhN0EVyBUyIeeq_x1V7U-JSbAJ2O9Pm94AHMO3xLkCuVTxGmi_u8xeiXmFlLNYWorXoZUPg5jeXxDAwipD1EGxoAT5ShTQQRkI_R3UR3Ts4AqpBPTYotKQQISLVJVWB22WY_ad8-xsKXgRJ8iPcCr1qerK6adyhuiN5MstC99NgBEQD7xgCvmjoX30ifwd2iC_a7s9b-h6jut5g4ltD1yng7bIt_uDXt8dT-y-N_K8kT0eHjro15GH09NCx3HHw7Hbd5zJ6PAbSZAMFw