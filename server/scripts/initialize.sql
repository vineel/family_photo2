delete from account;
insert into account (account_id, email, first_name, last_name, nickname, family_id, created_at, updated_at) values (1,'vineel@vineel.com','Vineel','Shah','Vineel', null, NOW(), NOW());
insert into account (account_id, email, first_name, last_name, nickname, family_id, created_at, updated_at) values (2,'leeseidenberg@gmail.com','Lee','Sidenberg','Lee', null, NOW(), NOW());
insert into account (account_id, email, first_name, last_name, nickname, family_id, created_at, updated_at) values (3,'vineelshah@gmail.com','Roxanne','Sokaris ','Roxanne', null, NOW(), NOW());

insert into family (family_id, family_extid, display_name) values (1,'shah','Stephanie, Vineel, Zephyros and Elektra');
insert into family (family_id, family_extid, display_name) values (2,'seidenberg','Lee, Marcia, Eliot and Sam');
insert into family (family_id, family_extid, display_name) values (3,'sokaris','Stratton and Roxanne');

insert into family_has_family (src_family_id, dst_family_id, relation_type) values (1,2,'HI_VOL');
insert into family_has_family (src_family_id, dst_family_id, relation_type) values (1,3,'HI_VOL');
insert into family_has_family (src_family_id, dst_family_id, relation_type) values (2,1,'HI_VOL');

update account set family_id=1 where account_id=1;
update account set family_id=2 where account_id=2;
update account set family_id=3 where account_id=3;
