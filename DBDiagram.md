<!-- 
erDiagram
    ROLES {
        string id
        string roleName
        string description
    }

    USERS {
        string id
        string username
        string email
        string password
        string roleId
        date createdAt
        date updatedAt
    }

    USERIMAGE {
        string id
        string userId
        string imageId
        boolean isUsed
    }

    IMAGES {
        string id
        string url
        string description
        date createdAt
        date updatedAt
    }

    POSTS {
        string id
        string title
        enum status
        string postDetailId
        string authorId
        string categoryId
        date createdAt
        date updatedAt
        date deletedAt
    }

    POSTDETAILS {
        string id
        string content
    }

    CATEGORIES {
        string id
        string name
        string slug
    }

    COMMENTS {
        string id
        string title
        string content
        string postId
        string userId
        boolean isActive
        date createdAt
        date updatedAt
    }

    ROLES ||--o{ USERS : "has"
    USERS ||--o{ USERIMAGE : "has"
    USERS ||--o{ POSTS : "writes"
    USERS ||--o{ COMMENTS : "writes"
    USERIMAGE ||--|| IMAGES : "references"
    POSTS ||--|| POSTDETAILS : "contains"
    POSTS ||--o| CATEGORIES : "belongs to"
    POSTS ||--o{ COMMENTS : "has" 
-->
# Link: https://mermaid.live/edit#pako:eNqlVV2PojAU_Sukz2pg_AB5MyOZkIzjRp2XCS8desUm0Jq27Kwr_vdtBR0G2R3iwgP29tzb03tO6xHFnADyEYg5xYnAWcQs_ayWz8HaOpYD80glKEssSm5CgqfwgjO4mSAgY0H3inJWzp2i6sfrOlh1rJ5LEKytOmSYpjfRPZbyg4t2lmEtTLACKxagP2SmGvF8T-rxL7zDxewp6M49vA3TDCdfuLxzTQ4zi8pXCaSx5nm9rs0S6fcq3L37H8v1piMRRVVakwxYnukprHJ5qxiXag5Ki9nSKpyrHW_rYawZJlwc7pX0GieQwt82Ow82s_C545ZjzhSwZpnH2SZ4Wq7Crgq2Wl2medKsu1wsgpc75Whj3FAk_N7Nn66dxYr-hP90V3njFEW_z4_VBeFbEdphGaH6rVFDlEfxX6jSsgbxIaiCdtC1l-24chWDLYrLaTRIAVsQwOJPdLlahawbyMBNtzFlLWBe1G1isO-QcpZIS_EWdINwtXXUQ4mgBPlK5NBDGQh9P-ohOhskQmoH2lnIZBDY4jxVJuuk0_aYvXGeXTIFz5Md8rc4lXpUqlX9NVwg-lTy9YHF1xRgBMQjz5lC_vhcEflH9Av5fcdxB97ENq89tifu1Ouhg4kPpwPHdj3PHY7sh8nU80499PtMwxm49th5cF1HZ41G46Fz-gNjr_hK