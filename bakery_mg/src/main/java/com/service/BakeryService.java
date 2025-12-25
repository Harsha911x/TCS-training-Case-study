package com.service;

import java.util.List;

import com.bean.Bakery;
import com.dao.BakeryDao;

public class BakeryService {
	public List<Bakery> getBakeryList() {
		BakeryDao dao=new BakeryDao();
		return dao.getBakeryList();
	}

	public Bakery getBakeryDetails(int BakeryId) {
		BakeryDao dao=new BakeryDao();
		return dao.getBakeryDetails(BakeryId);
	}

	public boolean insertBakery(Bakery cust) {
		BakeryDao dao=new BakeryDao();
		return dao.insertBakery(cust);
	}
}
